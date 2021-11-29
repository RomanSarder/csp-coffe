import { makeChannel } from '@Lib/channel/channel';
import { Events } from '@Lib/channel/constants';
import { take } from '@Lib/operators/take';
import { close } from '@Lib/operators/close';
import { integrationTestGeneratorRunner } from '@Lib/testGeneratorRunner';
import { makePut } from '@Lib/operators/internal/makePut';

describe('take', () => {
    it('should take a put value from channel', async () => {
        const ch = makeChannel();
        const { iterator } = integrationTestGeneratorRunner(take(ch));
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
            const { iterator } = integrationTestGeneratorRunner(take(ch));
            close(ch);
            expect((await iterator.next()).value).toEqual(
                Events.CHANNEL_CLOSED,
            );
        });
    });

    describe('when the channel is closed after take was put', () => {
        it('should release take and reset channel', async () => {
            const ch = makeChannel();
            const { iterator } = integrationTestGeneratorRunner(take(ch));
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
