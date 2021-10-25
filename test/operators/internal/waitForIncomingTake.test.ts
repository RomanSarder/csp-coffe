import { makeChannel } from '@Lib/channel';
import { makeTake, waitForIncomingTakeAsync } from '@Lib/operators/internal';
import { eventLoopQueue } from '@Lib/internal';

describe('waitForIncomingTake', () => {
    it('should return promise which resolves only after any item gets to take queue', async () => {
        const spy = jest.fn();
        const ch = makeChannel();
        const promise = waitForIncomingTakeAsync(ch).then(spy);
        await eventLoopQueue();
        expect(spy).not.toHaveBeenCalled();
        makeTake(ch);
        await promise;
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
