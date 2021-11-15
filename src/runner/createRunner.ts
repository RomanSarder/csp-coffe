import {
    CancellablePromise,
    createCancellablePromise,
} from '@Lib/cancellablePromise';
import { InstructionType, isInstruction } from '@Lib/go';
import { isGenerator } from '@Lib/go/worker/shared';
import { CancelError, isCancelError } from './cancelError';

export const createRunner = (iterator: Generator): CancellablePromise<any> => {
    const state = {
        isCancelled: false,
    };
    /* Persist a list of dependent runners */
    /* Cancel them on cancel */
    let currentRunner: CancellablePromise<any> | undefined;
    const forkedRunners: CancellablePromise<any>[] = [];

    const {
        resolve: resolveStepper,
        reject: rejectStepper,
        cancellablePromise: stepperPromise,
    } = createCancellablePromise();

    const { resolve, reject, cancellablePromise } = createCancellablePromise(
        async () => {
            state.isCancelled = true;
            const cancelCurrentRunnerPromise = currentRunner
                ? currentRunner.cancel()
                : Promise.resolve();
            const forkedRunnerCancellations = Promise.all(
                forkedRunners.map((forkedRunner) => {
                    return forkedRunner.cancel();
                }),
            );
            try {
                await cancelCurrentRunnerPromise;
            } finally {
                await forkedRunnerCancellations;
            }
            try {
                iterator.throw(new CancelError());
            } catch (e) {
                // In case generator does not have try/catch block
                // Swallow error on purpose
                if (!isCancelError(e)) {
                    throw e;
                }
            } finally {
                await stepperPromise;
            }
        },
    );

    const step = async (verb: 'next' | 'throw', arg?: any): Promise<any> => {
        if (state.isCancelled) {
            return undefined;
        }
        try {
            let result;

            try {
                result = iterator[verb](arg);
            } catch (e) {
                if (verb === 'throw') {
                    reject(e);
                    return null;
                }
                throw e;
            }

            if (result.done) {
                const returnResult = await result.value;
                await Promise.all(forkedRunners);
                resolve(returnResult);
                return returnResult;
            }

            let value = await result.value;

            if (value instanceof Error) {
                throw value;
            }

            if (isInstruction(value)) {
                const instruction = value;
                const instructionResult = await instruction.function(
                    ...instruction.args,
                );

                if (isGenerator(instructionResult)) {
                    const isFork = instruction.type === InstructionType.FORK;
                    const subRunner = createRunner(instructionResult);

                    if (isFork) {
                        forkedRunners.push(subRunner);
                        return step('next', subRunner);
                    }
                }
                value = instructionResult;
            }

            if (isGenerator(value)) {
                const subRunner = createRunner(value);

                currentRunner = subRunner;

                let nextActionPromise;
                try {
                    const taskResult = await subRunner;
                    nextActionPromise = step('next', taskResult);
                } catch (e) {
                    nextActionPromise = step('throw', e);
                }
                currentRunner = undefined;
                return nextActionPromise;
            }

            return step('next', value);
        } catch (err) {
            return step('throw', err);
        }
    };

    step('next').then(resolveStepper, rejectStepper);

    return cancellablePromise;
};
