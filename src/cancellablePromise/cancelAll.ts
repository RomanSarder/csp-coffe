import { isCancellablePromise } from '.';
import { CancellablePromise } from './entity';

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
