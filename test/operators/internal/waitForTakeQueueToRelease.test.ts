import { integrationTestGeneratorRunner } from '@Lib/testGeneratorRunner';
import { makeChannel } from '@Lib/channel';
import {
    makeTake,
    releaseTake,
    waitForTakeQueueToRelease,
} from '@Lib/operators';

describe('waitForTakeQueueToRelease', () => {
    describe('when take buffer is blocked', () => {
        it('should complete which resolves only after put buffer becomes unblocked', async () => {
            const ch = makeChannel();
            makeTake(ch);
            const { next } = integrationTestGeneratorRunner(
                waitForTakeQueueToRelease(ch),
            );
            expect((await next()).done).toEqual(false);
            releaseTake(ch);
            expect((await next()).done).toEqual(true);
        });
    });

    describe('when take buffer is unblocked', () => {
        it('should resolve immediately', async () => {
            const ch = makeChannel();
            const { next } = integrationTestGeneratorRunner(
                waitForTakeQueueToRelease(ch),
            );
            expect((await next()).done).toEqual(true);
        });
    });
});
