import { CancellablePromise } from './entity';

export function isCancellablePromise(
    promise: CancellablePromise<any> | any,
): promise is CancellablePromise<any> {
    return (
        promise && promise.then && !!(promise as CancellablePromise<any>).cancel
    );
}
