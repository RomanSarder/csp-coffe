import { eventLoopQueue } from '@Lib/internal';
import { fromPromise } from '@Lib/operators/creation/fromPromise';
import { takeAsync } from '@Lib/operators/takeAsync';

describe('fromPromise', () => {
    it('should create channel with promise result in it', async () => {
        const promise = Promise.resolve('test');
        const ch = fromPromise(promise);

        expect(await takeAsync(ch)).toEqual('test');
    });

    it('should close the channel when value is taken', async () => {
        const promise = Promise.resolve('test');
        const ch = fromPromise(promise);

        await takeAsync(ch);
        await eventLoopQueue();
        expect(ch.isClosed).toEqual(true);
    });
});
