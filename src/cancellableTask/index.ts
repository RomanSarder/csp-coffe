import {
    asyncGeneratorProxy,
    GeneratorReturn,
    runAsyncGenerator,
} from '@Lib/go';
import { eventLoopQueue } from '@Lib/internal';

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

export const createCancellableTask = <
    F extends (...args: readonly any[]) => Generator,
    G = ReturnType<F>,
    Return = GeneratorReturn<G>,
>({
    fn,
    args,
    isFork = false,
}: {
    fn: F;
    args: Parameters<F>;
    isFork?: boolean;
    parentTasks?: CancellableTask<any>[];
}): CancellableTask<Return> => {
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
    const asyncIterator = asyncGeneratorProxy(fn(...args));
    const result = runAsyncGenerator(asyncIterator);

    (resultPromise as CancellableTask<any>)[IS_FORK] = () => isFork;
    (resultPromise as CancellableTask<any>)[IS_CANCELLED] = () =>
        state.isCancelled;

    (resultPromise as CancellableTask<any>)[CANCEL] = async (
        message?: string,
    ) => {
        if (state.isRunning) {
            console.log('try cancel');
            try {
                state.isCancelled = true;
                console.log('cancelling', fn.name);
                await asyncIterator.throw(new CancelError(message));
            } catch (e) {
                console.log('on cancel', e);
                onCancel(e);
            }
        }
    };

    const createPromise = async () => {
        await eventLoopQueue();
        try {
            const completion = await Promise.race([result, cancelled]);
            state.isRunning = false;
            console.log('COMPLETION', completion);
            onResolve(completion);
        } catch (e) {
            console.log('maybe got');
        }
    };
    createPromise();

    return resultPromise as CancellableTask<Return>;
};
