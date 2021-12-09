import type { CancellablePromise } from '@Lib/cancellablePromise';
import { createCancellablePromise } from '@Lib/cancellablePromise';
import type { Instruction } from '@Lib/go';
import { isCancelError } from '../cancellablePromise/utils/isCancelError';
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
                iterator.throw(reason);
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

    childrenIteratorsRunner.setCancelHandler(cancellablePromise.cancel);

    const { step } = makeIteratorStepper({
        state,
        iterator,
        onInstruction,
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
                    reject(error);
                } else {
                    resolve(value);
                }
            }
        } catch (e) {
            reject(e);
        }
    })();

    workerPromise.then(resolveStepper, rejectStepper);

    return cancellablePromise;
};
