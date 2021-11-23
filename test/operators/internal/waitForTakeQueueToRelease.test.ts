import { testGeneratorRunner } from '@Lib/testGeneratorRunner';
import { makeChannel } from '@Lib/channel/channel';
import { makeTake } from '@Lib/operators/internal/makeTake';
import { releaseTake } from '@Lib/operators/internal/releaseTake';
import { waitForTakeQueueToRelease } from '@Lib/operators/internal/waitForTakeQueueToRelease';

describe('waitForTakeQueueToRelease', () => {
    describe('when take buffer is blocked', () => {
        it('should complete which resolves only after put buffer becomes empty', async () => {
            const ch = makeChannel();
            makeTake(ch);
            const { iterator } = testGeneratorRunner(
                waitForTakeQueueToRelease(ch),
            );
            expect((await iterator.next()).done).toEqual(false);
            releaseTake(ch);
            expect((await iterator.next()).done).toEqual(true);
        });
    });

    describe('when take buffer is unblocked', () => {
        it('should complete immediately', async () => {
            const ch = makeChannel();
            const { iterator } = testGeneratorRunner(
                waitForTakeQueueToRelease(ch),
            );
            expect((await iterator.next()).done).toEqual(true);
        });
    });
});
