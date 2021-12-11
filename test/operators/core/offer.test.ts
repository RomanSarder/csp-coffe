import { close, makeChannel } from '@Lib/channel';
import { PutBuffer } from '@Lib/channel/entity/privateKeys';
import { offer } from '@Lib/operators';
import { integrationTestGeneratorRunner } from '@Lib/testGeneratorRunner';

describe('offer', () => {
    it('should put value in channel and return true', async () => {
        const ch = makeChannel();
        const { next } = integrationTestGeneratorRunner(offer(ch, 'test1'));
        await next();
        expect((await next()).value).toEqual(true);
        expect(ch[PutBuffer].getElementsArray()).toEqual(['test1']);
    });

    describe('when the channel is closed', async () => {
        const ch = makeChannel();
        close(ch);
        const { next } = integrationTestGeneratorRunner(offer(ch, 'test1'));
        expect((await next()).value).toEqual(null);
        expect(ch[PutBuffer].getElementsArray()).toEqual([]);
    });
});
