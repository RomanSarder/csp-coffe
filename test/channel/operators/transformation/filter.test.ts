import { BufferType } from '@Lib/buffer';
import { makeChannel } from '@Lib/channel';
import { close, filter, put, take } from '@Lib/channel/operators';
import { eventLoopQueue } from '@Lib/internal';

describe('filter', () => {
    it('should return channel with filtered values from source channels', async () => {
        const ch1 = makeChannel<number>(BufferType.DROPPING, 2);
        const ch2 = makeChannel<string>(BufferType.DROPPING, 2);
        const ch3 = filter(
            (num) => {
                if (typeof num === 'string') {
                    return parseInt(num, 10) % 2 === 0;
                }
                return num % 2 === 0;
            },
            [ch1, ch2],
        );

        await put(ch1, 1);
        await put(ch2, '2');
        expect(await take(ch3)).toEqual('2');
        await eventLoopQueue();
        await put(ch2, '3');
        await put(ch1, 4);
        expect(await take(ch3)).toEqual(4);
        await eventLoopQueue();
        close(ch1);
        close(ch2);
        close(ch3);
        await eventLoopQueue();
    });

    it('should return channel with specified configuration', async () => {
        const ch1 = makeChannel<number>(BufferType.DROPPING, 2);
        const ch2 = filter(
            (num) => {
                if (typeof num === 'string') {
                    return parseInt(num, 10) % 2 === 0;
                }
                return num % 2 === 0;
            },
            [ch1],
            {
                bufferType: BufferType.SLIDING,
                capacity: 5,
            },
        );
        expect(ch2.putBuffer.type).toEqual(BufferType.SLIDING);
        expect(ch2.capacity).toEqual(5);
        close(ch1);
        close(ch2);
        await eventLoopQueue();
    });

    describe('when the source channel closes', () => {
        it('should close the result channel', async () => {
            const ch1 = makeChannel<number>(BufferType.DROPPING, 2);
            const ch2 = makeChannel<string>(BufferType.DROPPING, 2);
            const ch3 = filter(
                (num) => {
                    if (typeof num === 'string') {
                        return parseInt(num, 10) % 2 === 0;
                    }
                    return num % 2 === 0;
                },
                [ch1, ch2],
            );
            close(ch1);
            close(ch2);
            await eventLoopQueue();
            expect(ch3.isClosed).toEqual(true);
            await eventLoopQueue();
        });
    });
});
