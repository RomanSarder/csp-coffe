import { createCancellablePromise } from '@Lib/cancellablePromise';

describe('cancellablePromise', () => {
    it('should resolve', async () => {
        const spy = jest.fn();

        const { resolve, cancellablePromise } = createCancellablePromise();

        const promise = cancellablePromise.then(spy);

        resolve('test1');

        await promise;
        expect(spy).toHaveBeenCalledWith('test1');
    });

    it('should reject', async () => {
        const spy = jest.fn();

        const { reject, cancellablePromise } = createCancellablePromise();

        const promise = cancellablePromise.catch(spy);

        reject(new Error('test1'));
        await promise;
        expect(spy).toHaveBeenCalledWith(new Error('test1'));
    });

    describe('when run in Promise.all', () => {
        it('should resolve with values', async () => {
            const { resolve: resolve1, cancellablePromise: promise1 } =
                createCancellablePromise();
            const { resolve: resolve2, cancellablePromise: promise2 } =
                createCancellablePromise();

            const promiseAll = Promise.all([promise1, promise2]);

            resolve1(1);
            resolve2(2);

            const values = await promiseAll;

            expect(values).toEqual([1, 2]);
        });

        it('should reject with error', async () => {
            const spy = jest.fn();
            const { resolve, cancellablePromise: promise1 } =
                createCancellablePromise();
            const { reject, cancellablePromise: promise2 } =
                createCancellablePromise();

            const promiseAll = Promise.all([promise1, promise2]).catch(spy);

            resolve(1);
            reject(new Error('Custom'));

            await promiseAll;

            expect(spy).toHaveBeenCalledWith(new Error('Custom'));
        });
    });
});
