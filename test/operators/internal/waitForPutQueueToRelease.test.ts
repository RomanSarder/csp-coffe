import { makeChannel } from '@Lib/channel';
import {
    makePut,
    releasePut,
    waitForPutQueueToReleaseAsync,
} from '@Lib/operators/internal';
import { eventLoopQueue } from '@Lib/internal';

describe('waitForPutQueueToReleaseAsync', () => {
    it('should return promise which resolves only after put queue becomes empty', async () => {
        const spy = jest.fn();
        const ch = makeChannel();
        makePut(ch, 'test');
        const promise = waitForPutQueueToReleaseAsync(ch).then(spy);
        await eventLoopQueue();
        expect(spy).not.toHaveBeenCalled();
        releasePut(ch);
        await promise;
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
