import { makeChannel } from '@Lib/channel';
import { putAsync } from '@Lib/operators/core/putAsync';
import { pipe } from '@Lib/operators/combinators/pipe';
import { takeAsync } from '@Lib/operators/core/takeAsync';
import { close } from '@Lib/operators/core/close';
import { CreatableBufferType } from '@Lib/buffer';

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
