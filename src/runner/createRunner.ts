import {
    cancelAll,
    CancellablePromise,
    createCancellablePromise,
    isCancellablePromise,
} from '@Lib/cancellablePromise';
import { InstructionType, isInstruction } from '@Lib/go';
import { isGenerator } from '@Lib/shared';
import { CancelError, isCancelError } from './cancelError';
import { StepperVerb } from './entity';
import { handleCancellablePromise } from './handleCancellablePromise';
import { handleGenerator } from './handleGenerator';

export const createRunner = (iterator: Generator): CancellablePromise<any> => {
    const state = {
        isCancelled: false,
    };
    /* Persist a list of dependent runners */
    /* Cancel them on cancel */
    const currentRunners: CancellablePromise<any>[] = [];
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
                await cancelAll(currentRunners);
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

    const step = async (verb: StepperVerb, arg?: any): Promise<any> => {
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
                return handleCancellablePromise({
                    promise: result.value,
                    currentRunners,
                    stepFn: step,
                });
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
                    return handleGenerator({
                        stepFn: step,
                        currentRunners,
                        forkedRunners,
                        generator: instructionResult,
                        isFork: instruction.type === InstructionType.FORK,
                    });
                }
                value = instructionResult;
            }

            if (isGenerator(value)) {
                return handleGenerator({
                    stepFn: step,
                    currentRunners,
                    forkedRunners,
                    generator: value,
                    isFork: false,
                });
            }

            return step('next', value);
        } catch (err) {
            return step('throw', err);
        }
    };

    step('next').then(resolveStepper, rejectStepper);

    return cancellablePromise;
};
