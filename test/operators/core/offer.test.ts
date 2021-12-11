import { close, makeChannel } from '@Lib/channel';
import { Values } from '@Lib/channel/entity/privateKeys';
import { offer } from '@Lib/operators';
import { integrationTestGeneratorRunner } from '@Lib/testGeneratorRunner';

describe('offer', () => {
    it('should put value in channel and return true', async () => {
        const ch = makeChannel();
        const { next } = integrationTestGeneratorRunner(offer(ch, 'test1'));
        await next();
        console.log(await next());
        expect(ch[Values]).toEqual(['test1']);
    });

    describe('when the channel is closed', () => {
        it('should return null and not put any values', async () => {
            const ch = makeChannel();
            close(ch);
            const { next } = integrationTestGeneratorRunner(offer(ch, 'test1'));
            expect((await next()).value).toEqual(null);
            expect(ch[Values]).toEqual([]);
        });
    });
});
