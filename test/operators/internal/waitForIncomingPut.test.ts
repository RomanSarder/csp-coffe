import { makeChannel } from '@Lib/channel';
import { makePut, waitForIncomingPutAsync } from '@Lib/operators/internal';
import { eventLoopQueue } from '@Lib/internal';

describe('waitForIncomingPut', () => {
    it('should return promise which resolves only after any item gets to put queue', async () => {
        const spy = jest.fn();
        const ch = makeChannel();
        const promise = waitForIncomingPutAsync(ch).then(spy);
        await eventLoopQueue();
        expect(spy).not.toHaveBeenCalled();
        makePut(ch, 'test');
        await promise;
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
