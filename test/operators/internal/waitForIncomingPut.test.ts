import { makeChannel } from '@Lib/channel';
import { makePut, waitForIncomingPutGenerator } from '@Lib/operators/internal';
import { asyncGeneratorProxy } from '@Lib/go/worker';
import { makeParkCommand } from '@Lib/go';

describe('waitForIncomingPut', () => {
    describe('when there is no items in put buffer', () => {
        it('should complete only after any item gets to put buffer', () => {
            const ch = makeChannel();
            const iterator = asyncGeneratorProxy(
                waitForIncomingPutGenerator(ch),
            );
            expect(iterator.next().value).toEqual(makeParkCommand());
            makePut(ch, 'test1');
            expect(iterator.next().done).toEqual(true);
        });
    });

    describe('when there is already an item in put buffer', () => {
        it('should complete immediately', () => {
            const ch = makeChannel();
            makePut(ch, 'test1');
            const iterator = asyncGeneratorProxy(
                waitForIncomingPutGenerator(ch),
            );

            expect(iterator.next().done).toEqual(true);
        });
    });
});
