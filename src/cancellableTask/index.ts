import {
    CancellablePromise,
    createCancellablePromise,
} from '@Lib/cancellablePromise';
import { InstructionType, isInstruction } from '@Lib/go';
import { isGenerator } from '@Lib/go/worker/shared';

export const CANCEL = Symbol('CANCEL');
export const IS_CANCELLED = Symbol('IS_CANCELLED');
export const IS_FORK = Symbol('IS_FORK');

export class CancelError extends Error {
    constructor(message?: string) {
        super(message); // 'Error' breaks prototype chain here
        Object.setPrototypeOf(this, new.target.prototype); // restore prototype chain
        this.name = 'CancelError';
    }
}

export const isCancelError = (error: any): error is CancelError =>
    error instanceof Error && error instanceof CancelError;

export interface CancellableTask<T> extends Promise<T> {
    [CANCEL](message?: string): Promise<void>;
    [IS_CANCELLED](): boolean;
    [IS_FORK](): boolean;
}

export const createCancellableTask = ({
    iterator,
}: {
    iterator: Generator;
    isFork?: boolean;
    parentTasks?: CancellableTask<any>[];
}): CancellablePromise<any> => {
    const state = {
        isRunning: true,
        isCancelled: false,
    };
    // eslint-disable-next-line no-use-before-define
    const { cancellablePromise: cancellableRunnerPromise } = runner(iterator);

    const { resolve, reject, cancellablePromise } = createCancellablePromise(
        async () => {
            if (state.isRunning) {
                state.isCancelled = true;
                await cancellableRunnerPromise.cancel();
            }
        },
    );

    const createPromise = async () => {
        let completionResult;
        try {
            completionResult = await Promise.race([
                cancellableRunnerPromise,
                cancellablePromise,
            ]);
            resolve(completionResult);
        } catch (e) {
            reject(e);
        } finally {
            state.isRunning = false;
        }
    };
    createPromise().catch((e) => {
        reject(e);
    });

    return cancellablePromise;
};

const runner = (iterator: Generator) => {
    const state = {
        isCancelled: false,
    };
    /* Persist a list of dependent runners */
    /* Cancel them on cancel */
    const ongoingTasks: CancellablePromise<any>[] = [];

    const {
        resolve: resolveStepper,
        reject: rejectStepper,
        cancellablePromise: stepperPromise,
    } = createCancellablePromise();

    const { resolve, reject, cancellablePromise } = createCancellablePromise(
        async () => {
            state.isCancelled = true;
            const cancelPromises = ongoingTasks.map(async (task) => {
                await task.cancel();
            });
            await Promise.all([stepperPromise, cancelPromises]);
            try {
                iterator.throw(new CancelError());
            } catch (e) {
                // In case generator does not have try/catch block
                // Swallow error on purpose
                if (!isCancelError(e)) {
                    throw e;
                }
            }
        },
    );

    const step = async (verb: 'next' | 'throw', arg?: any): Promise<any> => {
        if (state.isCancelled) {
            return null;
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
                    const task = createCancellableTask({
                        iterator: instructionResult,
                        isFork,
                    });

                    if (isFork) {
                        return step('next', task);
                    }
                    ongoingTasks.push(task);

                    let nextActionPromise;
                    try {
                        const taskResult = await task;
                        nextActionPromise = step('next', taskResult);
                    } catch (e) {
                        nextActionPromise = step('throw', e);
                    }
                    ongoingTasks.pop();
                    return nextActionPromise;
                }
                return step('next', instructionResult);
            }

            if (isGenerator(value)) {
                value = await createCancellableTask({ iterator: value });
            }

            return step('next', value);
        } catch (err) {
            return step('throw', err);
        }
    };

    step('next').then(resolveStepper, rejectStepper);

    return {
        it: iterator,
        cancellablePromise,
    };
};
