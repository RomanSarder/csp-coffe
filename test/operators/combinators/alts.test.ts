import { makeChannel } from '@Lib/channel';
import { makePut, alts, releasePut, takeAsync, close } from '@Lib/operators';
import { delay } from '@Lib/shared/utils/delay';

describe('alts', () => {
    describe('when provided a list of channels', () => {
        describe('when any of the channels has data in buffer', () => {
            it('should immediately return a data from channel which contains it', async () => {
                const ch1 = makeChannel();
                const ch2 = makeChannel();
                makePut(ch2, 'test2');

                const result = await alts([ch1, ch2]);

                expect(result.ch.is(ch2)).toEqual(true);
                expect(result.value).toEqual('test2');
            });
        });

        describe('when both channels has data in buffer', () => {
            it('should immediately return a data from a first channel', async () => {
                const ch1 = makeChannel();
                const ch2 = makeChannel();
                makePut(ch1, 'test1');
                makePut(ch2, 'test2');

                const result = await alts([ch1, ch2]);

                expect(result.ch.is(ch1)).toEqual(true);
                expect(result.value).toEqual('test1');
            });
        });

        describe('when no channel has data in buffer', () => {
            it('should wait for any channel to get new data and return it', async () => {
                const ch1 = makeChannel();
                const ch2 = makeChannel();

                const altsPromise = alts([ch1, ch2]);

                makePut(ch1, 'test1');

                const altsResult = await altsPromise;
                expect(altsResult.ch.is(ch1)).toEqual(true);
                expect(altsResult.value).toEqual('test1');
            });
        });
    });

    describe('when provided a list of put definitions', () => {
        describe('when both any of the channels is unblocked', () => {
            it('should immediately put value into the first channel', async () => {
                const ch1 = makeChannel();
                const ch2 = makeChannel();

                const result = await alts([
                    [ch1, 'test1'],
                    [ch2, 'test2'],
                ]);

                expect(result.ch.is(ch1)).toEqual(true);
                expect(result.value).toEqual(true);
            });
        });

        describe('when both channels are blocked', () => {
            it('should put a value into a channel which unblocks first', async () => {
                const spy = jest.fn();
                const ch1 = makeChannel();
                const ch2 = makeChannel();
                makePut(ch1, 'filler1');
                makePut(ch2, 'filler2');

                const altsPromise = alts([
                    [ch1, 'test1'],
                    [ch2, 'test2'],
                ]).then((val) => {
                    spy(val);
                });

                expect(spy).not.toHaveBeenCalled();
                await delay(500);
                releasePut(ch1);
                await delay(500);
                await takeAsync(ch1);
                await altsPromise;
                expect(spy.mock.calls[0][0].value).toEqual(true);
                expect(spy.mock.calls[0][0].ch.is(ch1)).toEqual(true);
            });

            describe('when both channels are closed', () => {
                it('should return the result of first unsuccessful put operation', async () => {
                    const ch1 = makeChannel();
                    const ch2 = makeChannel();
                    makePut(ch1, 'filler1');
                    makePut(ch2, 'filler2');

                    const altsPromise = alts([
                        [ch1, 'test1'],
                        [ch2, 'test2'],
                    ]);
                    await delay(500);
                    close(ch1);
                    close(ch2);

                    const result = await altsPromise;
                    expect(result.value).toEqual(false);
                    expect(result.ch.is(ch1)).toEqual(true);
                });
            });
        });
    });
});
