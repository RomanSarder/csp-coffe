import type { CancellablePromise } from '@Lib/cancellablePromise/entity/cancellablePromise';

export type ChildrenIteratorsRunner = {
    setCancelHandler(handler: (reason: any) => Promise<void>): void;

    run<T = any>(runIteratorPromise: CancellablePromise<T>): Promise<T>;
    fork<T = any>(
        runIteratorPromise: CancellablePromise<T>,
    ): CancellablePromise<T>;
    spawn<T = any>(
        runIteratorPromise: CancellablePromise<T>,
    ): CancellablePromise<T>;

    waitForForks(): Promise<void>;

    cancelForks(): Promise<void[]>;
    cancelOngoing(): Promise<void[]>;
};
