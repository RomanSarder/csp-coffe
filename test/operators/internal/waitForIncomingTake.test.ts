import { makeChannel } from '@Lib/channel';
import {
    makeTake,
    waitForIncomingTakeGenerator,
} from '@Lib/operators/internal';
import { asyncGeneratorProxy } from '@Lib/go/worker';
import { makeParkCommand } from '@Lib/go';

describe('waitForIncomingTake', () => {
    describe('when there is no items in take buffer', () => {
        it('should complete only after any item gets to take buffer', async () => {
            const ch = makeChannel();
            const iterator = asyncGeneratorProxy(
                waitForIncomingTakeGenerator(ch),
            );
            expect((await iterator.next()).value).toEqual(makeParkCommand());
            makeTake(ch);
            expect((await iterator.next()).done).toEqual(true);
        });
    });

    describe('when there is already an item in take buffer', () => {
        it('should return immediately', async () => {
            const ch = makeChannel();
            makeTake(ch);
            const iterator = asyncGeneratorProxy(
                waitForIncomingTakeGenerator(ch),
            );
            expect((await iterator.next()).done).toEqual(true);
        });
    });
});
