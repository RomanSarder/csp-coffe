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
    isFork = false,
}: {
    iterator: Generator;
    isFork?: boolean;
    parentTasks?: CancellableTask<any>[];
}): CancellableTask<any> => {
    const state = {
        isRunning: true,
        isCancelled: false,
    };
    let onResolve: (value: any) => void;
    let onCancel: (e: any) => void;

    const resultPromise = new Promise((resolve) => {
        onResolve = resolve;
    });
    const cancelled = new Promise((resolve) => {
        onCancel = resolve;
    });
    // eslint-disable-next-line no-use-before-define
    const { result, cancel } = runner(iterator);

    (resultPromise as CancellableTask<any>)[IS_FORK] = () => isFork;
    (resultPromise as CancellableTask<any>)[IS_CANCELLED] = () =>
        state.isCancelled;

    (resultPromise as CancellableTask<any>)[CANCEL] = async (
        message?: string,
    ) => {
        if (state.isRunning) {
            try {
                state.isCancelled = true;
                await cancel();
            } catch (e) {
                console.log('FAILED TO CANCEL', e);
            } finally {
                onCancel(message);
            }
        }
    };

    const createPromise = async () => {
        const completion = await Promise.race([result, cancelled]);
        state.isRunning = false;
        onResolve(completion);
    };
    createPromise();

    return resultPromise as CancellableTask<any>;
};

const runner = (iterator: Generator) => {
    const state = {
        isCancelled: false,
    };
    /* Use trick with .race here */
    let onResolve: (res: any) => void;
    let onCancel: (message?: string) => void;
    /* Persist a list of dependent runners */
    /* Cancel them on cancel */
    const ongoingTasks: CancellableTask<any>[] = [];

    const cancelPromise = new Promise((resolve) => {
        onCancel = resolve;
    });
    const resultPromise = new Promise((resolve) => {
        onResolve = resolve;
    });

    const step = async (verb: 'next' | 'throw', arg?: any): Promise<any> => {
        const result = iterator[verb](arg);

        if (state.isCancelled) {
            onResolve('CANCELLED');
        }

        if (result.done) {
            const returnResult = await result.value;
            console.log('resolving with', returnResult);
            onResolve(returnResult);
            return returnResult;
        }
        try {
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
                    const taskResult = await task;
                    ongoingTasks.pop();
                    return step('next', taskResult);
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

    const stepperPromise = step('next');

    return {
        it: iterator,
        result: Promise.race([resultPromise, cancelPromise]),
        async cancel() {
            state.isCancelled = false;
            try {
                iterator.throw(new CancelError());
            } catch (e) {
                // In case generator does not have try/catch block
                // Swallow error on purpose
                console.log('THROWN ERRR');
            } finally {
                const cancelPromises = ongoingTasks.map(async (task) => {
                    await task[CANCEL]();
                });
                try {
                    await Promise.all([
                        Promise.all(cancelPromises),
                        stepperPromise,
                    ]);
                } finally {
                    console.log('cancelled');
                    onCancel();
                }
            }
        },
    };
};
