import {
    cancelAll,
    CancellablePromise,
    createCancellablePromise,
    isCancellablePromise,
} from '@Lib/cancellablePromise';
import { InstructionType, isInstruction } from '@Lib/go';
import { isGenerator } from '@Lib/shared';
import { CancelError, isCancelError } from './cancelError';

export const createRunner = (iterator: Generator): CancellablePromise<any> => {
    const state = {
        isCancelled: false,
    };
    /* Persist a list of dependent runners */
    /* Cancel them on cancel */
    const currentRunner: CancellablePromise<any>[] = [];
    const forkedRunners: CancellablePromise<any>[] = [];

    const {
        resolve: resolveStepper,
        reject: rejectStepper,
        cancellablePromise: stepperPromise,
    } = createCancellablePromise();

    const { resolve, reject, cancellablePromise } = createCancellablePromise(
        async () => {
            state.isCancelled = true;
            try {
                await cancelAll(currentRunner);
            } finally {
                await cancelAll(forkedRunners);
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
                    return Promise.resolve();
                }
                throw e;
            }

            if (result.done) {
                const returnResult = await result.value;
                await Promise.all(forkedRunners);
                resolve(returnResult);
                return returnResult;
            }

            let value;

            if (isCancellablePromise(result.value)) {
                const subRunner = result.value;
                currentRunner.push(subRunner);
                let nextAction;
                try {
                    const runnerResult = await subRunner;
                    nextAction = step('next', runnerResult);
                } catch (e) {
                    nextAction = step('throw', e);
                }
                currentRunner.pop();
                return nextAction;
            }
            value = await result.value;

            await result.value;

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

                currentRunner.push(subRunner);

                let nextActionPromise;
                try {
                    const taskResult = await subRunner;
                    nextActionPromise = step('next', taskResult);
                } catch (e) {
                    nextActionPromise = step('throw', e);
                }
                currentRunner.pop();
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
