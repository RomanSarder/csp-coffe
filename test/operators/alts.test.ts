import { makeChannel } from '@Lib/channel';
import { alts } from '@Lib/operators';
import { makePut } from '@Lib/operators/internal';

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
        describe('when any channel has space in buffer', () => {
            it('should put value into the channel with buffer space', async () => {
                const ch1 = makeChannel<string>();
                const ch2 = makeChannel<number>();
                makePut(ch2, 10);

                const result = await alts([
                    [ch1, 'test1'],
                    [ch2, '10'],
                ]);
            });
        });
    });
});
