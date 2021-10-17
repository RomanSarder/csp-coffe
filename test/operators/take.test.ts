import { events, makeChannel } from '@Lib/channel';
import { close, take } from '@Lib/operators';
import { makePut } from '@Lib/operators/internal';
import { eventLoopQueue } from '@Lib/internal';

describe('take', () => {
    it('should take a put value from channel', async () => {
        const ch = makeChannel();
        const spy = jest.fn();
        take(ch).then(spy);
        await eventLoopQueue();
        makePut(ch, 'test1');
        await eventLoopQueue();
        expect(spy).toHaveBeenCalledWith('test1');
    });

    describe('when channel is closed', () => {
        it('should return channel closed message', async () => {
            const ch = makeChannel();
            close(ch);
            const result = await take(ch);
            expect(result).toEqual(events.CHANNEL_CLOSED);
        });
    });

    describe('when the channel is closed after take was put', () => {
        it('should release take', async () => {
            const ch = makeChannel();
            const spy = jest.fn();
            take(ch).then(spy);
            await eventLoopQueue();
            close(ch);
            await eventLoopQueue();
            expect(spy).toHaveBeenCalledWith(events.CHANNEL_CLOSED);
            expect(ch.takeBuffer.getElementsArray()).toEqual([]);
        });
    });
});
