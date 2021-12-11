import {
    makeChannel,
    makePutRequest,
    push,
    releasePut,
    waitForPutQueueToRelease,
} from '@Lib/channel';

import { integrationTestGeneratorRunner } from '@Lib/testGeneratorRunner';

describe('waitForPutQueueToReleaseAsync', () => {
    describe('when put buffer is blocked', () => {
        it('should complete only after put buffer becomes unblocked', async () => {
            const ch = makeChannel();
            makePutRequest(ch);
            push(ch, 'test1');
            const { next } = integrationTestGeneratorRunner(
                waitForPutQueueToRelease(ch),
            );
            expect((await next()).done).toEqual(false);
            releasePut(ch);
            expect((await next()).done).toEqual(true);
        });
    });

    describe('when put buffer is not blocked', () => {
        it('should resolve immediately', async () => {
            const ch = makeChannel();
            const { next } = integrationTestGeneratorRunner(
                waitForPutQueueToRelease(ch),
            );
            expect((await next()).done).toEqual(true);
        });
    });
});
