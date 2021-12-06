import { CreatableBufferType } from '@Lib/buffer/entity/bufferType';
import { makeChannel } from '@Lib/channel/channel';
import {
    integrationTestGeneratorRunner,
    unitTestGeneratorRunner,
} from '@Lib/testGeneratorRunner';
import { put } from '@Lib/operators/core/put';
import { close } from '@Lib/operators/core/close';
import { makePut } from '@Lib/operators/internal/makePut';
import { releasePut } from '@Lib/operators/internal/releasePut';

describe('put', () => {
    it('should put a value to channel', async () => {
        const ch = makeChannel(CreatableBufferType.UNBLOCKING);
        const { next } = integrationTestGeneratorRunner(put(ch, 'test1'));
        await next();
        await next();
        await next();
        expect(ch.putBuffer.getElementsArray()).toEqual(['test1']);
    });

    it('should throw error if trying to put null', async () => {
        const ch = makeChannel();
        const { next } = integrationTestGeneratorRunner(put(ch, null));
        expect((await next()).error).toEqual(
            new Error('null values are not allowed'),
        );
        expect(ch.putBuffer.getElementsArray()).toEqual([]);
    });

    describe('when the channel is closed', () => {
        it('should not put anything and reset the channel', async () => {
            const ch = makeChannel();
            close(ch);
            const { next } = integrationTestGeneratorRunner(put(ch, 'test1'));
            await next();
            await next();
        });
    });

    describe('when the channel is closed after the item is put', () => {
        it('should release put', async () => {
            const ch = makeChannel();
            const { next } = unitTestGeneratorRunner(put(ch, 'test1'));
            await next();
            await next();
            await next();
            close(ch);
            expect((await next()).done).toEqual(true);
            expect(ch.putBuffer.getElementsArray()).toEqual([]);
        });
    });

    describe('when the channel buffer size is more than 1', () => {
        describe('when there is no pending take', () => {
            it('should not block put if no take request is there', async () => {
                const ch = makeChannel(CreatableBufferType.DROPPING, 2);
                const { next } = integrationTestGeneratorRunner(
                    put(ch, 'test1'),
                );
                await next();
                await next();
                expect((await next()).done).toEqual(true);
            });

            describe('when the buffer is full', () => {
                it('should block put request if buffer is full', async () => {
                    const ch = makeChannel(CreatableBufferType.FIXED, 2);
                    const { next } = unitTestGeneratorRunner(put(ch, 'test1'));
                    makePut(ch, 'test11');
                    makePut(ch, 'test12');
                    await next();
                    expect((await next()).done).toEqual(false);
                    releasePut(ch);
                    await next();
                    expect((await next()).done).toEqual(true);
                    expect(ch.putBuffer.getElementsArray()).toEqual([
                        'test12',
                        'test1',
                    ]);
                });
            });
        });
    });
});
