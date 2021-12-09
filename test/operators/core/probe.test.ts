import { makeChannel } from '@Lib/channel';
import { probe, close, makePut } from '@Lib/operators';
import {
    integrationTestGeneratorRunner,
    unitTestGeneratorRunner,
} from '@Lib/testGeneratorRunner';

describe('probe', () => {
    describe('when predicate returns true for value put in channel', () => {
        it('should delete value from channel and return it', async () => {
            const ch = makeChannel<string>();
            const { next } = integrationTestGeneratorRunner(
                probe(ch, () => true),
            );
            makePut(ch, 'test1');
            await next();
            await next();

            expect((await next()).value).toEqual('test1');
            expect(ch.putBuffer.getSize()).toEqual(0);
        });
    });

    describe('when predicate returns false for value put in channel', () => {
        it('should not take a value from channel', async () => {
            const ch = makeChannel<string>();
            const { next } = unitTestGeneratorRunner(probe(ch, () => false));
            makePut(ch, 'test1');
            await next();
            await next();
            await next();
            expect(ch.putBuffer.getSize()).toEqual(1);
        });
    });

    describe('when channel is closed', () => {
        it('should return null', async () => {
            const ch = makeChannel();
            const { next } = integrationTestGeneratorRunner(
                probe(ch, () => false),
            );
            close(ch);
            const result = await next();
            expect(result.done).toEqual(true);
            expect(result.value).toEqual(null);
        });
    });

    describe('when the channel is closed after take was put', () => {
        it('should delete take request and reset channel', async () => {
            const ch = makeChannel();
            const { next } = integrationTestGeneratorRunner(
                probe(ch, () => false),
            );
            makePut(ch, 'test1');
            await next();
            await next();
            close(ch);
            expect((await next()).value).toEqual(null);
            expect(ch.putBuffer.getElementsArray()).toEqual([]);
            expect(ch.takeBuffer.getElementsArray()).toEqual([]);
        });
    });
});
