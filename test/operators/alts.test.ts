import { BufferType } from '@Lib/buffer';
import { makeChannel } from '@Lib/channel';
import { eventLoopQueue } from '@Lib/internal';
import { alts } from '@Lib/operators';
import { makePut, releasePut } from '@Lib/operators/internal';

describe('alts', () => {
    describe('when given only channels', () => {
        describe('when any channel has value available', () => {
            it('should return value from first channel with available value', async () => {
                const ch1 = makeChannel<string>();
                const ch2 = makeChannel<number>();
                makePut(ch2, 10);

                const result = await alts([ch1, ch2]);
                expect(result.value).toEqual(10);
                expect(result.channel.is(ch2)).toEqual(true);
            });
        });
    });
    describe('when given only put definitions', () => {
        describe('when any channel has space in buffer immediately', () => {
            it('should put value into the channel with buffer space', async () => {
                const ch1 = makeChannel<string>();
                const ch2 = makeChannel<number>();
                makePut(ch2, 10);

                const result = await alts([
                    [ch1, 'test1'],
                    [ch2, 10],
                ]);
                expect(result.value).toEqual(true);
                expect(result.channel.is(ch1)).toEqual(true);
            });
        });

        describe('when no channel as space in buffer immediately', () => {
            it('should wait until any operation succeeds', async () => {
                const ch1 = makeChannel<string>();
                const ch2 = makeChannel<number>(BufferType.FIXED, 2);
                const spy = jest.fn();
                makePut(ch2, 10);
                makePut(ch2, 30);
                makePut(ch1, 'test1');

                alts([
                    [ch1, 'test2'],
                    [ch2, 20],
                ]).then((res) => {
                    spy(res);
                });

                await eventLoopQueue();

                expect(spy).not.toHaveBeenCalled();

                await eventLoopQueue();

                releasePut(ch2);
                releasePut(ch2);

                await eventLoopQueue();

                expect(spy).toHaveBeenCalledWith({ value: true, channel: ch2 });
            });
        });
    });
});
