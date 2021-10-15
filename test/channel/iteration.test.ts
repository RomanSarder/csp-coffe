import { BufferType } from '@Lib/buffer';
import { makeChannel, put, take, close } from '@Lib/channel';
import { map, filter, reduce } from '@Lib/channel/iteration';
import { eventLoopQueue } from '@Lib/internal';

describe('Channel Iteration', () => {
    describe('map', () => {
        it('should return channel with mapped values', async () => {
            const ch1 = makeChannel<number>();
            const ch2 = map((num: number) => num * 10, ch1);

            await put(ch1, 1);
            expect(await take(ch2)).toEqual(10);
            await eventLoopQueue();
            await put(ch1, 2);
            expect(await take(ch2)).toEqual(20);
            await eventLoopQueue();
            await put(ch1, 3);
            expect(await take(ch2)).toEqual(30);
            close(ch1);
            await eventLoopQueue();
        });
    });

    describe('filter', () => {
        it('should return channel with filtered values', async () => {
            const ch1 = makeChannel<number>(BufferType.DROPPING, 2);
            const ch2 = filter((num: number) => num % 2 === 0, ch1);

            await put(ch1, 1);
            await put(ch1, 2);
            expect(await take(ch2)).toEqual(2);
            await eventLoopQueue();
            await put(ch1, 3);
            await put(ch1, 4);
            expect(await take(ch2)).toEqual(4);
            await eventLoopQueue();
            close(ch1);
            await eventLoopQueue();
        });
    });

    describe('reduce', () => {
        it('should return channel with reduced value', async () => {
            const ch1 = makeChannel<string>();
            const ch2 = reduce(
                (acc, next) => {
                    return acc + parseInt(next, 10);
                },
                0,
                ch1,
            );
            await put(ch1, '1');
            await put(ch1, '2');
            await put(ch1, '3');
            close(ch1);
            await eventLoopQueue();
            expect(await take(ch2)).toEqual(6);
        });
    });
});
