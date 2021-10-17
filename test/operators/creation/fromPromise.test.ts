import { eventLoopQueue } from '@Lib/internal';
import { fromPromise, take } from '@Lib/operators';

describe('fromPromise', () => {
    it('should create channel with promise result in it', async () => {
        const promise = Promise.resolve('test');
        const ch = fromPromise(promise);

        expect(await take(ch)).toEqual('test');
    });

    it('should close the channel on promise completion', async () => {
        const promise = Promise.resolve('test');
        const ch = fromPromise(promise);

        await eventLoopQueue();
        expect(ch.isClosed).toEqual(true);
    });
});
