import {
    makeChannel,
    makePutRequest,
    push,
    releasePut,
    waitUntilBufferEmpty,
} from '@Lib/channel';
import { integrationTestGeneratorRunner } from '@Lib/testGeneratorRunner';
import { CreatableBufferType } from '@Lib/buffer';

describe('waitUntilBufferEmpty', () => {
    describe('when put buffer is not empty', () => {
        it('should complete only after put buffer becomes unblocked', async () => {
            const ch = makeChannel(CreatableBufferType.FIXED, 2);
            makePutRequest(ch);
            push(ch, 'test1');
            makePutRequest(ch);
            push(ch, 'test2');
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
