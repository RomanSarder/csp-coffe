import { CreatableBufferType } from '@Lib/buffer';
import { makeChannel } from '@Lib/channel';
import { close } from '@Lib/operators/core/close';
import { reduce } from '@Lib/operators/collection/reduce';
import { putAsync } from '@Lib/operators/core/putAsync';
import { takeAsync } from '@Lib/operators/core/takeAsync';
import { eventLoopQueue } from '@Lib/shared/utils';

describe('reduce', () => {
    it('should return channel with reduced value', async () => {
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
        expect(ch2.putBuffer.type).toEqual(CreatableBufferType.SLIDING);
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
