import { makeChannel } from '@Lib/channel';
import { makePut, waitForIncomingPut } from '@Lib/channel/operators/internal';
import { eventLoopQueue } from '@Lib/internal';

describe('waitForIncomingPut', () => {
    it('should return promise which resolves only after any item gets to put queue', async () => {
        const spy = jest.fn();
        const ch = makeChannel();
        waitForIncomingPut(ch).then(spy);
        await eventLoopQueue();
        expect(spy).not.toHaveBeenCalled();
        makePut(ch, 'test');
        await eventLoopQueue();
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
