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

        // try {
        reject(new Error('test1'));
        await promise;
        // } catch (e) {
        //     console.log('What?', e);
        // }

        expect(spy).toHaveBeenCalledWith(new Error('test1'));
    });
});
