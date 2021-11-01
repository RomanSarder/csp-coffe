import { makeChannel } from '@Lib/channel';
import {
    makePut,
    releasePut,
    waitForPutQueueToReleaseGenerator,
} from '@Lib/operators/internal';
import { asyncGeneratorProxy } from '@Lib/go/worker';
import { makeParkCommand } from '@Lib/go';

describe('waitForPutQueueToReleaseAsync', () => {
    describe('when put buffer is blocked', () => {
        it('should complete only after put buffer becomes empty', () => {
            const ch = makeChannel();
            makePut(ch, 'test');
            const iterator = asyncGeneratorProxy(
                waitForPutQueueToReleaseGenerator(ch),
            );
            expect(iterator.next().value).toEqual(makeParkCommand());
            releasePut(ch);
            expect(iterator.next().done).toEqual(true);
        });
    });

    describe('when put buffer is not blocked', () => {
        it('should complete immediately', () => {
            const ch = makeChannel();
            const iterator = asyncGeneratorProxy(
                waitForPutQueueToReleaseGenerator(ch),
            );
            expect(iterator.next().done).toEqual(true);
        });
    });
});
