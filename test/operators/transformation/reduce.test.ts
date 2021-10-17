import { BufferType } from '@Lib/buffer';
import { makeChannel } from '@Lib/channel';
import { close, put, reduce, take } from '@Lib/operators';
import { eventLoopQueue } from '@Lib/internal';

describe('reduce', () => {
    it('should return channel with reduced value', async () => {
        const ch1 = makeChannel<string>();
        const ch2 = makeChannel<number>();
        const ch3 = reduce(
            (acc, next) => {
                if (typeof next === 'string') {
                    return acc + parseInt(next, 10);
                }
                return acc + next;
            },
            0,
            [ch1, ch2],
        );
        await put(ch1, '1');
        await eventLoopQueue();
        await put(ch2, 2);
        await eventLoopQueue();
        close(ch1);
        close(ch2);
        await eventLoopQueue();
        expect(await take(ch3)).toEqual(3);
        close(ch3);
        await eventLoopQueue();
    });

    it('should return channel with specified configuration', async () => {
        const ch1 = makeChannel<number>(BufferType.DROPPING, 2);
        const ch2 = reduce(
            (acc, next) => {
                if (typeof next === 'string') {
                    return acc + parseInt(next, 10);
                }
                return acc + next;
            },
            0,
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

    describe('when the reduced value is taken', () => {
        it('should close the result channel', async () => {
            const ch1 = makeChannel<string>();
            const ch2 = makeChannel<number>();
            const ch3 = reduce(
                (acc, next) => {
                    if (typeof next === 'string') {
                        return acc + parseInt(next, 10);
                    }
                    return acc + next;
                },
                0,
                [ch1, ch2],
            );
            await put(ch1, '1');
            await put(ch2, 2);
            await eventLoopQueue();
            close(ch1);
            close(ch2);
            await take(ch3);
            await eventLoopQueue();
            expect(ch2.isClosed).toEqual(true);
            await eventLoopQueue();
        });
    });
});
