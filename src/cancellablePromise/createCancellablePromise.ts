import { CancellablePromise } from './entity';

export function createCancellablePromise<T = any>(cancelCallback?: any) {
    /* move this thing outside */
    let onResolve: (value: any) => void;
    let onReject: (value: any) => void;
    let onCancel: (e?: any) => void;
    let onCancelWithError: (e?: any) => void;

    let resultPromise = new Promise((resolve, reject) => {
        onResolve = resolve;
        onReject = reject;
    });

    const cancelPromise = new Promise((resolve, reject) => {
        onCancel = resolve;
        onCancelWithError = reject;
    });

    const racingPromises = [resultPromise, cancelPromise];

    const finalPromise = Promise.race(racingPromises).catch((e) => {
        console.log('race error', e);
        // Swallow on purpose;
    }) as CancellablePromise<T>;

    finalPromise.cancel = async function performCancellation() {
        try {
            if (cancelCallback) {
                await cancelCallback();
            }
            onCancel();
        } catch (e) {
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
        resultPromise = resultPromise.catch(
            onRejected,
        ) as CancellablePromise<any>;

        return this;
    };

    return {
        cancellablePromise: finalPromise,
        resolve: async (value: any) => {
            onResolve(value);
        },
        reject: async (value: any) => {
            onReject(value);
            onCancelWithError(value);
        },
    };
}
