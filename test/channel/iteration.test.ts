import { BufferType } from '@Lib/buffer';
import { makeChannel } from '@Lib/channel';
import { map, filter, reduce } from '@Lib/channel/iteration';
import { close, put, take } from '@Lib/channel/operators';
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

        describe('when the source channel is closed', () => {
            it('should close the result channel', async () => {
                const ch1 = makeChannel<number>();
                const ch2 = map((num: number) => num * 10, ch1);

                close(ch1);
                await eventLoopQueue();
                expect(ch2.isClosed).toEqual(true);
            });
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

        describe('when the source channel closes', () => {
            it('should close the result channel', async () => {
                const ch1 = makeChannel();
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const ch2 = filter((_: unknown) => true, ch1);
                close(ch1);
                await eventLoopQueue();
                expect(ch2.isClosed).toEqual(true);
            });
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
            await eventLoopQueue();
            await put(ch1, '2');
            await eventLoopQueue();
            await put(ch1, '3');
            await eventLoopQueue();
            close(ch1);
            await eventLoopQueue();
            expect(await take(ch2)).toEqual(6);
        });

        describe('when the reduced value is taken', () => {
            it('should close the result channel', async () => {
                const ch1 = makeChannel<string>();
                const ch2 = reduce(
                    (acc, next) => {
                        return acc + parseInt(next, 10);
                    },
                    0,
                    ch1,
                );
                await put(ch1, '1');
                await eventLoopQueue();
                close(ch1);
                await take(ch2);
                await eventLoopQueue();
                expect(ch2.isClosed).toEqual(true);
            });
        });
    });
});
