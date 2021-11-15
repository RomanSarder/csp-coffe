import { Events, makeChannel } from '@Lib/channel';
import { close, take } from '@Lib/operators';
import { asyncGeneratorProxy } from '@Lib/asyncGeneratorProxy';
import { makePut } from '@Lib/operators/internal';

describe('take', () => {
    it('should take a put value from channel', async () => {
        const ch = makeChannel();
        const iterator = asyncGeneratorProxy(take(ch));
        makePut(ch, 'test1');
        await iterator.next();
        await iterator.next();
        await iterator.next();
        await iterator.next();
        expect((await iterator.next()).value).toEqual('test1');
    });

    describe('when channel is closed', () => {
        it('should return channel closed message', async () => {
            const ch = makeChannel();
            const iterator = asyncGeneratorProxy(take(ch));
            close(ch);
            expect((await iterator.next()).value).toEqual(
                Events.CHANNEL_CLOSED,
            );
        });
    });

    describe('when the channel is closed after take was put', () => {
        it('should release take and reset channel', async () => {
            const ch = makeChannel();
            const iterator = asyncGeneratorProxy(take(ch));
            makePut(ch, 'test1');
            await iterator.next();
            await iterator.next();
            await iterator.next();
            close(ch);
            expect((await iterator.next()).value).toEqual(
                Events.CHANNEL_CLOSED,
            );
            expect(ch.putBuffer.getElementsArray()).toEqual([]);
            expect(ch.takeBuffer.getElementsArray()).toEqual([]);
        });
    });
});
