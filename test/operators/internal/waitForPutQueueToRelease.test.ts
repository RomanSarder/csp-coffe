import { makeChannel } from '@Lib/channel';
import {
    makePut,
    releasePut,
    waitForPutQueueToRelease,
} from '@Lib/operators/internal';
import { eventLoopQueue } from '@Lib/internal';

describe('waitForPutQueueToRelease', () => {
    it('should return promise which resolves only after put queue becomes empty', async () => {
        const spy = jest.fn();
        const ch = makeChannel();
        makePut(ch, 'test');
        waitForPutQueueToRelease(ch).then(spy);
        await eventLoopQueue();
        expect(spy).not.toHaveBeenCalled();
        releasePut(ch);
        await eventLoopQueue();
        expect(spy).toHaveBeenCalledTimes(1);
    });
});
