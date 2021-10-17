import { makeChannel } from '@Lib/channel';
import { put, pipe, take, close } from '@Lib/channel/operators';
import { eventLoopQueue } from '@Lib/internal';

describe('pipe', () => {
    it('should put values from source channel to destination channel', async () => {
        const ch1 = makeChannel();
        const ch2 = makeChannel();
        pipe(ch2, ch1);

        await put(ch1, 'test1');
        expect(await take(ch2)).toEqual('test1');

        close(ch1);
        close(ch2);
        await eventLoopQueue();
    });

    describe('when source channel is closed', () => {
        describe('when keepOpen param is false', () => {
            it('should close destination channel', async () => {
                const ch1 = makeChannel();
                const ch2 = makeChannel();
                pipe(ch2, ch1);
                close(ch1);
                await eventLoopQueue();
                expect(ch2.isClosed).toEqual(true);
            });
        });

        describe('when keepOpen param is true', () => {
            it('should not close destination channel', async () => {
                const ch1 = makeChannel();
                const ch2 = makeChannel();
                pipe(ch2, ch1, true);
                close(ch1);
                await eventLoopQueue();
                expect(ch2.isClosed).toEqual(false);
                close(ch2);
                await eventLoopQueue();
            });
        });
    });
});
