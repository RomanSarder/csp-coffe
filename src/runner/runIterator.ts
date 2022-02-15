import type { CancellablePromise } from '@Lib/cancellablePromise';
import { createCancellablePromise } from '@Lib/cancellablePromise';
import type { Instruction } from '@Lib/instruction';
import { isCancelError } from '../cancellablePromise/utils/isCancelError';
import { exitStepperMessage } from './entity/exitStepperMessage';
import { makeChildrenIteratorsRunner } from './makeChildrenIteratorsRunner';
import { makeIteratorStepper } from './makeIteratorStepper';

export const runIterator = (
    iterator: Generator,
    onInstruction?: (instruction: Instruction) => void,
): CancellablePromise<any> => {
    const state = {
        isCancelled: false,
    };

    const {
        resolve: resolveStepper,
        reject: rejectStepper,
        cancellablePromise: stepperPromise,
    } = createCancellablePromise();
    const childrenIteratorsRunner = makeChildrenIteratorsRunner();

    const { resolve, reject, cancellablePromise } = createCancellablePromise(
        async (reason) => {
            state.isCancelled = true;
            try {
                await childrenIteratorsRunner.cancelOngoing();
            } finally {
                await childrenIteratorsRunner.cancelForks();
            }
            try {
                const tryCatchReturnValue = iterator.throw(reason).value;
                await stepperPromise;
                // eslint-disable-next-line no-unsafe-finally
                return tryCatchReturnValue;
            } catch (e) {
                // In case generator does not have try/catch block
                // Swallow error on purpose
                if (!isCancelError(e)) {
                    throw e;
                }
            }
        },
    );

    childrenIteratorsRunner.setCancelHandler(cancellablePromise.cancel);

    const { step } = makeIteratorStepper({
        state,
        iterator,
        onInstruction,
        onGenerator: runIterator,
        childrenIteratorsRunner,
    });
    const workerPromise = (async () => {
        try {
            let stepResult = await step('next');

            while (!stepResult.done) {
                const { error, value } = stepResult;
                if (error) {
                    stepResult = await step('throw', error);
                } else {
                    stepResult = await step('next', value);
                }
            }
            const { done, error, value } = stepResult;

            if (done) {
                if (error) {
                    try {
                        await childrenIteratorsRunner.cancelForks();
                    } finally {
                        reject(error);
                    }
                } else {
                    try {
                        const result =
                            await childrenIteratorsRunner.waitForForks();

                        if (result === exitStepperMessage) {
                            return;
                        } else {
                            resolve(value);
                        }
                    } catch (e) {
                        reject(e);
                    }
                }
            }
        } catch (e) {
            reject(e);
        }
    })();

    workerPromise.then(resolveStepper, rejectStepper);

    return cancellablePromise;
};
