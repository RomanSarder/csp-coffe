import { BufferType } from '@Lib/buffer';
import { makeChannel } from '@Lib/channel';
import { map, filter, reduce } from '@Lib/channel/iteration';
import { close, put, take } from '@Lib/channel/operators';
import { eventLoopQueue } from '@Lib/internal';

describe('Channel Iteration', () => {
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
            expect(await take(ch3)).toEqual(10);
            await eventLoopQueue();
            await put(ch2, '2');
            expect(await take(ch3)).toEqual(20);
            close(ch1);
            close(ch2);
            await eventLoopQueue();
        });

        describe('when the source channels are closed', () => {
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
                close(ch2);
                await eventLoopQueue();
                expect(ch3.isClosed).toEqual(true);
            });
        });
    });

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
            });
        });
    });

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
            });
        });
    });
});
