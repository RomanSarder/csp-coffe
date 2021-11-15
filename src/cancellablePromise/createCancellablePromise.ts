import { CancellablePromise } from './entity';

export function createCancellablePromise<T = any>(cancelCallback?: any) {
    /* move this thing outside */
    let onResolve: (value: any) => void;
    let onReject: (value: any) => void;
    let onCancel: (e?: any) => void;

    const resultPromise = new Promise((resolve, reject) => {
        onResolve = resolve;
        onReject = reject;
    });

    const cancelPromise = new Promise((resolve) => {
        onCancel = resolve;
    });

    const finalPromise = Promise.race([
        resultPromise,
        cancelPromise,
    ]) as CancellablePromise<T>;

    finalPromise.cancel = async function performCancellation() {
        try {
            if (cancelCallback) {
                await cancelCallback();
            }
            onCancel();
        } catch (e) {
            console.log('cancelling with error');
            onReject(e);
        }
    };

    finalPromise.then = function thenProxy(onFulfilled) {
        const thenResult = Promise.prototype.then.call(
            this,
            onFulfilled,
        ) as CancellablePromise<any>;

        thenResult.cancel = this.cancel;
        thenResult.then = this.then;

        return thenResult;
    };

    finalPromise.catch = function catchProxy(onRejected) {
        const catchResult = Promise.prototype.catch.call(
            this,
            onRejected,
        ) as CancellablePromise<any>;

        catchResult.cancel = this.cancel;
        catchResult.catch = this.catch;

        return catchResult;
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