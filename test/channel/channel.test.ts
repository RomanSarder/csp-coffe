import { CreatableBufferType } from '@Lib/buffer';
import { Events, makeChannel, makeTimeoutChannel } from '@Lib/channel';
import { close, putAsync } from '@Lib/operators';
import { eventLoopQueue } from '@Lib/shared/utils';

describe('Channel', () => {
    describe('makeChannel', () => {
        it('should create a channel with buffers', () => {
            const ch = makeChannel();

            expect(ch.putBuffer.getElementsArray()).toEqual([]);
            expect(ch.takeBuffer.getElementsArray()).toEqual([]);
        });

        it('should be async iterable', async () => {
            const ch = makeChannel(CreatableBufferType.DROPPING, 10);

            await putAsync(ch, 'test1');
            await eventLoopQueue();
            await putAsync(ch, 'test2');
            await eventLoopQueue();
            await putAsync(ch, 'test3');
            await eventLoopQueue();

            const iterator = ch[Symbol.asyncIterator]();

            expect(await iterator.next()).toEqual({
                value: 'test1',
                done: false,
            });
            expect(await iterator.next()).toEqual({
                value: 'test2',
                done: false,
            });
            expect(await iterator.next()).toEqual({
                value: 'test3',
                done: false,
            });
            close(ch);
            expect(await iterator.next()).toEqual({
                value: Events.CHANNEL_CLOSED,
                done: true,
            });
        });
    });

    describe('makeTimeoutChannel', () => {
        it('should close itself after specified timeout', async () => {
            const ch = makeTimeoutChannel(1000);
            await new Promise<void>((resolve) => {
                setTimeout(resolve, 1000);
            });
            expect(ch.isClosed).toEqual(true);
        });
    });
});
