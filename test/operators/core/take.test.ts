import { makeChannel, Events } from '@Lib/channel';
import { take, close, makePut } from '@Lib/operators';
import {
    integrationTestGeneratorRunner,
    unitTestGeneratorRunner,
} from '@Lib/testGeneratorRunner';

describe('take', () => {
    it('should take a value from channel', async () => {
        const ch = makeChannel();
        const { next } = integrationTestGeneratorRunner(take(ch));
        makePut(ch, 'test1');
        await next();

        expect((await next()).value).toEqual('test1');
    });

    describe('when channel is closed', () => {
        it('should return channel closed message', async () => {
            const ch = makeChannel();
            const { next } = integrationTestGeneratorRunner(take(ch));
            close(ch);
            await next();
            const result = await next();
            expect(result.done).toEqual(true);
            expect(result.value).toEqual(Events.CHANNEL_CLOSED);
        });
    });

    describe('when the channel is closed after take was put', () => {
        it('should delete take request and reset channel', async () => {
            const ch = makeChannel();
            const { next } = unitTestGeneratorRunner(take(ch));
            makePut(ch, 'test1');
            await next();
            await next();
            close(ch);
            await next();
            await next();
            expect((await next()).value).toEqual(Events.CHANNEL_CLOSED);
            expect(ch.putBuffer.getElementsArray()).toEqual([]);
            expect(ch.takeBuffer.getElementsArray()).toEqual([]);
        });
    });
});
