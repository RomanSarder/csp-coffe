import { makeChannel } from '@Lib/channel';
import { makeParkCommand } from '@Lib/go';
import { asyncGeneratorProxy } from '@Lib/go/worker';
import {
    makeTake,
    releaseTake,
    waitForTakeQueueToReleaseGenerator,
} from '@Lib/operators/internal';

describe('waitForTakeQueueToRelease', () => {
    describe('when take buffer is blocked', () => {
        it('should complete which resolves only after put buffer becomes empty', async () => {
            const ch = makeChannel();
            makeTake(ch);
            const iterator = asyncGeneratorProxy(
                waitForTakeQueueToReleaseGenerator(ch),
            );
            expect((await iterator.next()).value).toEqual(makeParkCommand());
            releaseTake(ch);
            expect((await iterator.next()).done).toEqual(true);
        });
    });

    describe('when take buffer is unblocked', () => {
        it('should complete immediately', async () => {
            const ch = makeChannel();
            const iterator = asyncGeneratorProxy(
                waitForTakeQueueToReleaseGenerator(ch),
            );
            expect((await iterator.next()).done).toEqual(true);
        });
    });
});
