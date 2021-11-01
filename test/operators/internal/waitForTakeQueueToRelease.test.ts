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
        it('should complete which resolves only after put buffer becomes empty', () => {
            const ch = makeChannel();
            makeTake(ch);
            const iterator = asyncGeneratorProxy(
                waitForTakeQueueToReleaseGenerator(ch),
            );
            expect(iterator.next().value).toEqual(makeParkCommand());
            releaseTake(ch);
            expect(iterator.next().done).toEqual(true);
        });
    });

    describe('when take buffer is unblocked', () => {
        it('should complete immediately', () => {
            const ch = makeChannel();
            const iterator = asyncGeneratorProxy(
                waitForTakeQueueToReleaseGenerator(ch),
            );
            expect(iterator.next().done).toEqual(true);
        });
    });
});
