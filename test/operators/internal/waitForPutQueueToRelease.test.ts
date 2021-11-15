import { makeChannel } from '@Lib/channel';
import {
    makePut,
    releasePut,
    waitForPutQueueToRelease,
} from '@Lib/operators/internal';
import { asyncGeneratorProxy } from '@Lib/asyncGeneratorProxy';

describe('waitForPutQueueToReleaseAsync', () => {
    describe('when put buffer is blocked', () => {
        it('should complete only after put buffer becomes empty', async () => {
            const ch = makeChannel();
            makePut(ch, 'test');
            const iterator = asyncGeneratorProxy(waitForPutQueueToRelease(ch));
            expect((await iterator.next()).done).toEqual(false);
            releasePut(ch);
            expect((await iterator.next()).done).toEqual(true);
        });
    });

    describe('when put buffer is not blocked', () => {
        it('should complete immediately', async () => {
            const ch = makeChannel();
            const iterator = asyncGeneratorProxy(waitForPutQueueToRelease(ch));
            expect((await iterator.next()).done).toEqual(true);
        });
    });
});
