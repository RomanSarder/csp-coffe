import { CancellablePromise } from './entity';

export function createCancellablePromise<T = any>(cancelCallback?: any) {
    /* move this thing outside */
    let onResolve: (value?: any) => void;
    let onReject: (value: any) => void;

    const resultPromise = new Promise((resolve, reject) => {
        onResolve = resolve;
        onReject = reject;
    });

    const onRejectionCallbacks: Array<
        ((reason: any) => unknown) | undefined | null
    > = [];

    const finalPromise = Promise.resolve(resultPromise).catch((e) => {
        if (onRejectionCallbacks.length > 0) {
            return onRejectionCallbacks
                .reduce((acc, onRejectionCallback) => {
                    return acc.catch(onRejectionCallback) as Promise<never>;
                }, Promise.reject(e))
                .catch((error) => {
                    throw error;
                });
        }
        throw e;
    }) as CancellablePromise<T>;

    finalPromise.cancel = async function performCancellation() {
        try {
            if (cancelCallback) {
                await cancelCallback();
            }
            onResolve();
        } catch (e) {
            onReject(e);
        }
    };

    finalPromise.then = function thenProxy(onFulfilled, onRejected) {
        const thenResult = Promise.prototype.then.call(
            this,
            onFulfilled,
            onRejected,
        ) as CancellablePromise<any>;

        thenResult.cancel = this.cancel;
        thenResult.then = this.then;

        return thenResult;
    };

    finalPromise.catch = function catchProxy(onRejected) {
        onRejectionCallbacks.push(onRejected);

        return finalPromise;
    };

    return {
        cancellablePromise: finalPromise,
        resolve: async (value: any) => {
            onResolve(value);
        },
        reject: async (value: any) => {
            onReject(value);
        },
    };
}
