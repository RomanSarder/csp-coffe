import { CreatableBufferType } from '@Lib/buffer';
import { makeChannel, close } from '@Lib/channel';
import { PutBuffer } from '@Lib/channel/entity/privateKeys';
import { reduce, putAsync, takeAsync } from '@Lib/operators';
import { eventLoopQueue } from '@Lib/shared/utils';

describe('reduce', () => {
    describe('when source channels close', () => {
        it('should return channel with a value reduced from source channels', async () => {
            const ch1 = makeChannel<string>();
            const ch2 = makeChannel<number>();
            const { ch: ch3, promise } = reduce(
                (acc, next) => {
                    if (typeof next === 'string') {
                        return acc + parseInt(next, 10);
                    }
                    return acc + next;
                },
                0,
                [ch1, ch2],
            );
            await putAsync(ch1, '1');
            await putAsync(ch2, 2);
            close(ch1);
            close(ch2);
            await eventLoopQueue();
            expect(await takeAsync(ch3)).toEqual(3);
            close(ch3);
            await promise;
        });
    });

    it('should return channel with specified configuration', async () => {
        const ch1 = makeChannel<number>(CreatableBufferType.DROPPING, 2);
        const { ch: ch2, promise } = reduce(
            (acc, next) => {
                if (typeof next === 'string') {
                    return acc + parseInt(next, 10);
                }
                return acc + next;
            },
            0,
            [ch1],
            {
                bufferType: CreatableBufferType.SLIDING,
                capacity: 5,
            },
        );
        expect(ch2[PutBuffer].type).toEqual(CreatableBufferType.SLIDING);
        expect(ch2.capacity).toEqual(5);
        close(ch1);
        close(ch2);
        await promise;
    });

    describe('when the reduced value is taken', () => {
        it('should close the result channel', async () => {
            const ch1 = makeChannel<string>();
            const ch2 = makeChannel<number>();
            const { ch: ch3, promise } = reduce(
                (acc, next) => {
                    if (typeof next === 'string') {
                        return acc + parseInt(next, 10);
                    }
                    return acc + next;
                },
                0,
                [ch1, ch2],
            );
            await putAsync(ch1, '1');
            await putAsync(ch2, 2);
            await eventLoopQueue();
            close(ch1);
            close(ch2);
            await takeAsync(ch3);
            await promise;
            expect(ch2.isClosed).toEqual(true);
        });
    });
});
