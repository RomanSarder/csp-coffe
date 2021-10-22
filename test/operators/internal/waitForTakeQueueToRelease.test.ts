import { makeChannel } from '@Lib/channel';
import { eventLoopQueue } from '@Lib/internal';
import {
    makeTake,
    releaseTake,
    waitForTakeQueueToReleaseAsync,
} from '@Lib/operators/internal';

describe('waitForTakeQueueToRelease', () => {
    it('should return promise which resolves only after put queue becomes empty', async () => {
        const spy = jest.fn();
        const ch = makeChannel();
        makeTake(ch);
        const promise = waitForTakeQueueToReleaseAsync(ch).then(spy);
        await eventLoopQueue();
        expect(spy).not.toHaveBeenCalled();
        releaseTake(ch);

        await promise;

        expect(spy).toHaveBeenCalledTimes(1);
    });
});
