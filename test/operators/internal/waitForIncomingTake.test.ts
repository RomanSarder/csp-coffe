import { makeChannel } from '@Lib/channel';
import { makeTake, waitForIncomingTake } from '@Lib/operators/internal';
import { asyncGeneratorProxy } from '@Lib/asyncGeneratorProxy';

describe('waitForIncomingTake', () => {
    describe('when there is no items in take buffer', () => {
        it('should complete only after any item gets to take buffer', async () => {
            const ch = makeChannel();
            const iterator = asyncGeneratorProxy(waitForIncomingTake(ch));
            expect((await iterator.next()).done).toEqual(false);
            makeTake(ch);
            expect((await iterator.next()).done).toEqual(true);
        });
    });

    describe('when there is already an item in take buffer', () => {
        it('should return immediately', async () => {
            const ch = makeChannel();
            makeTake(ch);
            const iterator = asyncGeneratorProxy(waitForIncomingTake(ch));
            expect((await iterator.next()).done).toEqual(true);
        });
    });
});
