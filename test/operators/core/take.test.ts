import { makeChannel, Events, close, makePutRequest, push } from '@Lib/channel';
import { PutBuffer, TakeBuffer } from '@Lib/channel/entity/privateKeys';
import { take } from '@Lib/operators';
import {
    integrationTestGeneratorRunner,
    unitTestGeneratorRunner,
} from '@Lib/testGeneratorRunner';

describe('take', () => {
    it('should take a value from channel', async () => {
        const ch = makeChannel();
        const { next } = integrationTestGeneratorRunner(take(ch));
        makePutRequest(ch);
        push(ch, 'test1');
        await next();
        expect((await next()).value).toEqual('test1');
    });

    describe('when channel is closed', () => {
        it('should return channel closed message', async () => {
            const ch = makeChannel();
            const { next } = integrationTestGeneratorRunner(take(ch));
            close(ch);
            const result = await next();
            expect(result.done).toEqual(true);
            expect(result.value).toEqual(Events.CHANNEL_CLOSED);
        });
    });

    describe('when the channel is closed after take was put', () => {
        it('should delete take request and reset channel', async () => {
            const ch = makeChannel();
            const { next } = unitTestGeneratorRunner(take(ch));
            makePutRequest(ch);
            push(ch, 'test1');
            await next();
            close(ch);
            await next();
            expect((await next()).value).toEqual(Events.CHANNEL_CLOSED);
            expect(ch[PutBuffer].getElementsArray()).toEqual([]);
            expect(ch[TakeBuffer].getElementsArray()).toEqual([]);
        });
    });
});
