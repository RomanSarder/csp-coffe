import { makeChannel, close } from '@Lib/channel';
import { map, putAsync, takeAsync } from '@Lib/operators';
import { eventLoopQueue } from '@Lib/shared/utils';
import { CreatableBufferType } from '@Lib/buffer';
import { PutBuffer } from '@Lib/channel/entity/privateKeys';

describe('map', () => {
    it('should return channel with mapped values from source channels', async () => {
        const ch1 = makeChannel<number>(CreatableBufferType.UNBLOCKING);
        const ch2 = makeChannel<string>(CreatableBufferType.UNBLOCKING);
        const { ch: ch3 } = map(
            (item) => {
                if (typeof item === 'number') {
                    return item * 10;
                }
                return parseInt(item, 10) * 10;
            },
            [ch1, ch2],
        );
        await putAsync(ch1, 1);
        await putAsync(ch2, '2');
        expect(await takeAsync(ch3)).toEqual(10);
        expect(await takeAsync(ch3)).toEqual(20);
        close(ch1);
        close(ch2);
        close(ch3);
        await eventLoopQueue();
    });

    it('should return channel with specified configuration', async () => {
        const ch1 = makeChannel<number>();
        const { ch: ch2 } = map((a) => a + 2, [ch1], {
            bufferType: CreatableBufferType.SLIDING,
            capacity: 5,
        });
        expect(ch2[PutBuffer].type).toEqual(CreatableBufferType.SLIDING);
        expect(ch2.capacity).toEqual(5);
        close(ch1);
        close(ch2);
        await eventLoopQueue();
    });

    describe('when the source channels close', () => {
        it('should close the result channel', async () => {
            const ch1 = makeChannel<number>();
            const ch2 = makeChannel<string>();
            const { ch: ch3, promise } = map(
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
            await eventLoopQueue();
            close(ch2);
            await promise;
            expect(ch3.isClosed).toEqual(true);
        });
    });
});
