import { makeChannel } from '@Lib/channel';
import {
    makeTake,
    releaseTake,
    waitForTakeQueueToRelease,
} from '@Lib/operators/internal';
import { eventLoopQueue } from '@Lib/internal';

describe('waitForTakeQueueToRelease', () => {
    it('should return promise which resolves only after put queue becomes empty', async () => {
        const spy = jest.fn();
        const ch = makeChannel();
        makeTake(ch);
        waitForTakeQueueToRelease(ch).then(spy);
        await eventLoopQueue();
        expect(spy).not.toHaveBeenCalled();
        releaseTake(ch);
        await eventLoopQueue();
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
