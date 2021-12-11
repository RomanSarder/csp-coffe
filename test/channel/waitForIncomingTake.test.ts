import {
    makeChannel,
    makeTakeRequest,
    waitForIncomingTake,
} from '@Lib/channel';
import { integrationTestGeneratorRunner } from '@Lib/testGeneratorRunner';

describe('waitForIncomingTake', () => {
    describe('when there is no items in take buffer', () => {
        it('should complete only after any item gets to take buffer', async () => {
            const ch = makeChannel();
            const { next } = integrationTestGeneratorRunner(
                waitForIncomingTake(ch),
            );
            expect((await next()).done).toEqual(false);
            makeTakeRequest(ch);
            expect((await next()).done).toEqual(true);
        });
    });

    describe('when there is already an item in take buffer', () => {
        it('should resolve immediately', async () => {
            const ch = makeChannel();
            makeTakeRequest(ch);
            const { next } = integrationTestGeneratorRunner(
                waitForIncomingTake(ch),
            );
            expect((await next()).done).toEqual(true);
        });
    });
});
