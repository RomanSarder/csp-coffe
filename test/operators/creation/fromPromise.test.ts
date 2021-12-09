import { eventLoopQueue } from '@Lib/shared/utils';
import { fromPromise, takeAsync } from '@Lib/operators';

describe('fromPromise', () => {
    it('should create channel with promise result value', async () => {
        const promise = Promise.resolve('test');
        const ch = fromPromise(promise);

        expect(await takeAsync(ch)).toEqual('test');
    });

    it('should close the channel when value is taken', async () => {
        const promise = Promise.resolve('test');
        const ch = fromPromise(promise);

        await takeAsync(ch);
        await eventLoopQueue();
        await eventLoopQueue();
        await eventLoopQueue();
        expect(ch.isClosed).toEqual(true);
    });
});
