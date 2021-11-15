import { asyncGeneratorProxy } from '@Lib/asyncGeneratorProxy';
import { makeChannel } from '@Lib/channel';
import {
    makeTake,
    releaseTake,
    waitForTakeQueueToRelease,
} from '@Lib/operators/internal';

describe('waitForTakeQueueToRelease', () => {
    describe('when take buffer is blocked', () => {
        it('should complete which resolves only after put buffer becomes empty', async () => {
            const ch = makeChannel();
            makeTake(ch);
            const iterator = asyncGeneratorProxy(waitForTakeQueueToRelease(ch));
            expect((await iterator.next()).done).toEqual(false);
            releaseTake(ch);
            expect((await iterator.next()).done).toEqual(true);
        });
    });

    describe('when take buffer is unblocked', () => {
        it('should complete immediately', async () => {
            const ch = makeChannel();
            const iterator = asyncGeneratorProxy(waitForTakeQueueToRelease(ch));
            expect((await iterator.next()).done).toEqual(true);
        });
    });
});
