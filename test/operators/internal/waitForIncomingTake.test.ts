import { makeChannel } from '@Lib/channel/channel';
import { makeTake } from '@Lib/operators/internal/makeTake';
import { waitForIncomingTake } from '@Lib/operators/internal/waitForIncomingTake';
import { testGeneratorRunner } from '@Lib/testGeneratorRunner';

describe('waitForIncomingTake', () => {
    describe('when there is no items in take buffer', () => {
        it('should complete only after any item gets to take buffer', async () => {
            const ch = makeChannel();
            const { next } = testGeneratorRunner(waitForIncomingTake(ch));
            expect((await next()).done).toEqual(false);
            makeTake(ch);
            expect((await next()).done).toEqual(true);
        });
    });

    describe('when there is already an item in take buffer', () => {
        it('should return immediately', async () => {
            const ch = makeChannel();
            makeTake(ch);
            const { next } = testGeneratorRunner(waitForIncomingTake(ch));
            expect((await next()).done).toEqual(true);
        });
    });
});
