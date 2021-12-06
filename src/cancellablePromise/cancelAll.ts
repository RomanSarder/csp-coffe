import { isCancellablePromise } from './utils/isCancellablePromise';
import type { CancellablePromise } from './entity/cancellablePromise';

export function cancelAll(
    cancellablePromises: (CancellablePromise<any> | Promise<any>)[],
) {
    return Promise.all(
        cancellablePromises.map((promise) => {
            if (isCancellablePromise(promise)) {
                return promise.cancel();
            }
            return Promise.resolve();
        }),
    );
}
