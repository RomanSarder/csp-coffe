import { makeChannel } from '@Lib/channel/channel';
import { putAsync } from '@Lib/operators/putAsync';
import { pipe } from '@Lib/operators/pipe';
import { takeAsync } from '@Lib/operators/takeAsync';
import { close } from '@Lib/operators/close';
import { CreatableBufferType } from '@Lib/buffer/entity/bufferType';

describe('pipe', () => {
    it('should put values from source channel to destination channel', async () => {
        const ch1 = makeChannel(CreatableBufferType.UNBLOCKING);
        const ch2 = makeChannel(CreatableBufferType.UNBLOCKING);
        const { promise } = pipe(ch2, ch1);

        await putAsync(ch1, 'test1');
        expect(await takeAsync(ch2)).toEqual('test1');

        close(ch1);
        close(ch2);
        await promise;
    });

    describe('when source channel is closed', () => {
        describe('when keepOpen param is false', () => {
            it('should close destination channel', async () => {
                const ch1 = makeChannel(CreatableBufferType.UNBLOCKING);
                const ch2 = makeChannel(CreatableBufferType.UNBLOCKING);
                const { promise } = pipe(ch2, ch1);
                close(ch1);
                await promise;
                expect(ch2.isClosed).toEqual(true);
            });
        });

        describe('when keepOpen param is true', () => {
            it('should not close destination channel', async () => {
                const ch1 = makeChannel(CreatableBufferType.UNBLOCKING);
                const ch2 = makeChannel(CreatableBufferType.UNBLOCKING);
                const { promise } = pipe(ch2, ch1, true);
                close(ch1);
                await promise;
                expect(ch2.isClosed).toEqual(false);
                close(ch2);
            });
        });
    });
});
