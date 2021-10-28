import { events, makeChannel } from '@Lib/channel';
import { close, takeGenerator } from '@Lib/operators';
import { syncWorker } from '@Lib/go/worker';
import { makePut } from '@Lib/operators/internal';

describe('take', () => {
    it('should take a put value from channel', () => {
        const ch = makeChannel();
        const iterator = syncWorker(takeGenerator(ch));
        makePut(ch, 'test1');
        iterator.next();
        iterator.next();
        expect(iterator.next().value).toEqual('test1');
    });

    describe('when channel is closed', () => {
        it('should return channel closed message', () => {
            const ch = makeChannel();
            const iterator = syncWorker(takeGenerator(ch));
            close(ch);
            expect(iterator.next().value).toEqual(events.CHANNEL_CLOSED);
        });
    });

    describe('when the channel is closed after take was put', () => {
        it('should release take and reset channel', () => {
            const ch = makeChannel();
            const iterator = syncWorker(takeGenerator(ch));
            makePut(ch, 'test1');
            iterator.next();
            iterator.next();
            close(ch);
            expect(iterator.next().value).toEqual(events.CHANNEL_CLOSED);
            expect(ch.putBuffer.getElementsArray()).toEqual([]);
            expect(ch.takeBuffer.getElementsArray()).toEqual([]);
        });
    });
});
