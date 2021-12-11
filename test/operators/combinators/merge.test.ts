import { CreatableBufferType } from '@Lib/buffer';
import { makeChannel, close } from '@Lib/channel';
import { eventLoopQueue } from '@Lib/shared/utils';
import { merge, putAsync, takeAsync } from '@Lib/operators';
import { PutBuffer } from '@Lib/channel/entity/privateKeys';

describe('merge', () => {
    it('should return unblocking channel with values from source channels', async () => {
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
            expect(resultCh[PutBuffer].type).toEqual(
                CreatableBufferType.SLIDING,
            );

            close(ch1);
            close(ch2);

            await promise;
        });
    });
});
