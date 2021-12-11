import {
    makeChannel,
    makePutRequest,
    push,
    waitForIncomingPut,
} from '@Lib/channel';
import { integrationTestGeneratorRunner } from '@Lib/testGeneratorRunner';

describe('waitForIncomingPut', () => {
    describe('when there is no items in put buffer', () => {
        it('should complete only after any item gets to put buffer', async () => {
            const ch = makeChannel();
            const { next } = integrationTestGeneratorRunner(
                waitForIncomingPut(ch),
            );
            expect((await next()).done).toEqual(false);
            makePutRequest(ch);
            push(ch, 'test1');
            expect((await next()).done).toEqual(true);
        });
    });

    describe('when there is already an item in put buffer', () => {
        it('should resolve immediately', async () => {
            const ch = makeChannel();
            makePutRequest(ch);
            push(ch, 'test1');
            const { next } = integrationTestGeneratorRunner(
                waitForIncomingPut(ch),
            );

            expect((await next()).done).toEqual(true);
        });
    });
});
