import { CreatableBufferType } from '@Lib/buffer';
import { makeChannel } from '@Lib/channel';
import { close, map, put, take } from '@Lib/operators';
import { eventLoopQueue } from '@Lib/internal';

describe('map', () => {
    it('should return channel with mapped values from source channels', async () => {
        const ch1 = makeChannel<number>();
        const ch2 = makeChannel<string>();
        const ch3 = map(
            (item) => {
                if (typeof item === 'number') {
                    return item * 10;
                }
                return parseInt(item, 10) * 10;
            },
            [ch1, ch2],
        );

        await put(ch1, 1);
        await eventLoopQueue();
        await put(ch2, '2');
        await eventLoopQueue();
        expect(await take(ch3)).toEqual(10);
        await eventLoopQueue();
        expect(await take(ch3)).toEqual(20);
        close(ch1);
        close(ch2);
        close(ch3);
        await eventLoopQueue();
    });

    it('should return channel with specified configuration', async () => {
        const ch1 = makeChannel<number>();
        const ch2 = map((a) => a + 2, [ch1], {
            bufferType: CreatableBufferType.SLIDING,
            capacity: 5,
        });
        expect(ch2.putBuffer.type).toEqual(CreatableBufferType.SLIDING);
        expect(ch2.capacity).toEqual(5);
        close(ch1);
        close(ch2);
        await eventLoopQueue();
    });

    describe('when the source channels close', () => {
        it('should close the result channel', async () => {
            const ch1 = makeChannel<number>();
            const ch2 = makeChannel<string>();
            const ch3 = map(
                (item) => {
                    if (typeof item === 'number') {
                        return item * 10;
                    }
                    return parseInt(item, 10) * 10;
                },
                [ch1, ch2],
            );

            close(ch1);
            await eventLoopQueue();
            expect(ch3.isClosed).toEqual(false);
            close(ch2);
            await eventLoopQueue();
            expect(ch3.isClosed).toEqual(true);
            await eventLoopQueue();
        });
    });
});
