export interface CancellablePromise<T> extends Promise<T> {
    cancel: (reason?: any) => Promise<void>;
    then: (...args: Parameters<Promise<T>['then']>) => CancellablePromise<any>;
    catch: (
        ...args: Parameters<Promise<T>['catch']>
    ) => CancellablePromise<any>;
}
