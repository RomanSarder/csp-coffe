import { makeChannel } from '@Lib/channel';
import { makePut, releasePut, waitForPutQueueToRelease } from '@Lib/operators';

import { integrationTestGeneratorRunner } from '@Lib/testGeneratorRunner';

describe('waitForPutQueueToReleaseAsync', () => {
    describe('when put buffer is blocked', () => {
        it('should complete only after put buffer becomes empty', async () => {
            const ch = makeChannel();
            makePut(ch, 'test');
            const { next } = integrationTestGeneratorRunner(
                waitForPutQueueToRelease(ch),
            );
            expect((await next()).done).toEqual(false);
            releasePut(ch);
            expect((await next()).done).toEqual(true);
        });
    });

    describe('when put buffer is not blocked', () => {
        it('should complete immediately', async () => {
            const ch = makeChannel();
            const { next } = integrationTestGeneratorRunner(
                waitForPutQueueToRelease(ch),
            );
            expect((await next()).done).toEqual(true);
        });
    });
});
