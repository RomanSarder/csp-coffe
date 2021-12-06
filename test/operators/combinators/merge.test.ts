import { CreatableBufferType } from '@Lib/buffer';
import { makeChannel } from '@Lib/channel/channel';
import { eventLoopQueue } from '@Lib/internal';
import { close } from '@Lib/operators/close';
import { merge } from '@Lib/operators/combinators/merge';
import { putAsync } from '@Lib/operators/putAsync';
import { takeAsync } from '@Lib/operators/takeAsync';

describe('merge', () => {
    it('should return unbuffered channel with values from source channels', async () => {
        const ch1 = makeChannel<string>();
        const ch2 = makeChannel<number>();

        const { ch: resultCh, promise } = merge([ch1, ch2]);

        await putAsync(ch1, 'test1');
        await putAsync(ch2, 10);
        expect(await takeAsync(resultCh)).toEqual('test1');
        expect(await takeAsync(resultCh)).toEqual(10);

        close(ch1);
        close(ch2);

        await promise;
    });

    describe('when source channels get closed', () => {
        it('should close result channel when source channels are closed', async () => {
            const ch1 = makeChannel<string>();
            const ch2 = makeChannel<number>();

            const { ch: resultCh, promise } = merge([ch1, ch2]);

            close(ch1);
            await eventLoopQueue();
            expect(resultCh.isClosed).toEqual(false);
            close(ch2);
            await promise;
            expect(resultCh.isClosed).toEqual(true);
        });
    });

    describe('when given a result channel configuration', () => {
        it('should return the channel with defined configuration', async () => {
            const ch1 = makeChannel<string>();
            const ch2 = makeChannel<number>();

            const { ch: resultCh, promise } = merge([ch1, ch2], {
                bufferType: CreatableBufferType.SLIDING,
                capacity: 10,
            });

            expect(resultCh.capacity).toEqual(10);
            expect(resultCh.putBuffer.type).toEqual(
                CreatableBufferType.SLIDING,
            );

            close(ch1);
            close(ch2);

            await promise;
        });
    });
});
