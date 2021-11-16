import { CancellablePromise } from './entity';

export function cancelAll(cancellablePromises: CancellablePromise<any>[]) {
    return Promise.all(cancellablePromises.map((promise) => promise.cancel()));
}
