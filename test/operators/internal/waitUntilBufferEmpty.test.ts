import { makeChannel } from '@Lib/channel';
import { makePut, releasePut, waitUntilBufferEmpty } from '@Lib/operators';
import { integrationTestGeneratorRunner } from '@Lib/testGeneratorRunner';
import { CreatableBufferType } from '@Lib/buffer';

describe('waitUntilBufferEmpty', () => {
    describe('when put buffer is not empty', () => {
        it('should complete only after put buffer becomes unblocked', async () => {
            const ch = makeChannel(CreatableBufferType.FIXED, 2);
            makePut(ch, 'test1');
            makePut(ch, 'test2');
            const { next } = integrationTestGeneratorRunner(
                waitUntilBufferEmpty(ch),
            );
            expect((await next()).done).toEqual(false);
            releasePut(ch);
            expect((await next()).done).toEqual(false);
            releasePut(ch);
            expect((await next()).done).toEqual(true);
        });
    });

    describe('when put buffer is unblocked', () => {
        it('should complete immediately', async () => {
            const ch = makeChannel(CreatableBufferType.FIXED, 2);
            const { next } = integrationTestGeneratorRunner(
                waitUntilBufferEmpty(ch),
            );
            expect((await next()).done).toEqual(true);
        });
    });
});
