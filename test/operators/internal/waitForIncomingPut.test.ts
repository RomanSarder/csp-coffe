import { makeChannel } from '@Lib/channel';
import { makePut, waitForIncomingPut } from '@Lib/operators/internal';
import { asyncGeneratorProxy } from '@Lib/asyncGeneratorProxy';

describe('waitForIncomingPut', () => {
    describe('when there is no items in put buffer', () => {
        it('should complete only after any item gets to put buffer', async () => {
            const ch = makeChannel();
            const iterator = asyncGeneratorProxy(waitForIncomingPut(ch));
            expect((await iterator.next()).done).toEqual(false);
            makePut(ch, 'test1');
            expect((await iterator.next()).done).toEqual(true);
        });
    });

    describe('when there is already an item in put buffer', () => {
        it('should complete immediately', async () => {
            const ch = makeChannel();
            makePut(ch, 'test1');
            const iterator = asyncGeneratorProxy(waitForIncomingPut(ch));

            expect((await iterator.next()).done).toEqual(true);
        });
    });
});
