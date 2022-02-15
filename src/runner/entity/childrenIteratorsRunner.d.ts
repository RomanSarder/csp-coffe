import type { CancellablePromise } from '@Lib/cancellablePromise';

export type ChildrenIteratorsRunner = {
    setCancelHandler(handler: (reason: any) => Promise<void>): void;

    run<T = any>(runIteratorPromise: CancellablePromise<T>): Promise<T>;
    fork<T = any>(
        runIteratorPromise: CancellablePromise<T>,
    ): CancellablePromise<T>;
    spawn<T = any>(
        runIteratorPromise: CancellablePromise<T>,
    ): CancellablePromise<T>;

    waitForForks(): CancellablePromise<any>;

    cancelForks(): Promise<void[]>;
    cancelOngoing(): Promise<void[]>;
};
