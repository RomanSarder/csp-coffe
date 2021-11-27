import { makeChannel } from '@Lib/channel/channel';
import { makePut } from '@Lib/operators/internal/makePut';
import { waitForIncomingPut } from '@Lib/operators/internal/waitForIncomingPut';
import { testGeneratorRunner } from '@Lib/testGeneratorRunner';

describe('waitForIncomingPut', () => {
    describe('when there is no items in put buffer', () => {
        it('should complete only after any item gets to put buffer', async () => {
            const ch = makeChannel();
            const { next } = testGeneratorRunner(waitForIncomingPut(ch));
            expect((await next()).done).toEqual(false);
            makePut(ch, 'test1');
            expect((await next()).done).toEqual(true);
        });
    });

    describe('when there is already an item in put buffer', () => {
        it('should complete immediately', async () => {
            const ch = makeChannel();
            makePut(ch, 'test1');
            const { next } = testGeneratorRunner(waitForIncomingPut(ch));

            expect((await next()).done).toEqual(true);
        });
    });
});
