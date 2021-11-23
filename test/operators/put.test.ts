import { CreatableBufferType } from '@Lib/buffer';
import { makeChannel } from '@Lib/channel/channel';
import { testGeneratorRunner } from '@Lib/testGeneratorRunner';
import { put } from '@Lib/operators/put';
import { close } from '@Lib/operators/close';
import { makePut } from '@Lib/operators/internal/makePut';
import { releasePut } from '@Lib/operators/internal/releasePut';

describe('put', () => {
    it('should put a value to channel', async () => {
        const ch = makeChannel();
        const { iterator } = testGeneratorRunner(put(ch, 'test1'));
        await iterator.next();
        await iterator.next();
        await iterator.next();
        expect(ch.putBuffer.getElementsArray()).toEqual(['test1']);
    });

    it('should throw error if trying to put null', async () => {
        const ch = makeChannel();
        const { iterator } = testGeneratorRunner(put(ch, null));
        expect(iterator.next()).rejects.toEqual(
            new Error('null values are not allowed'),
        );
        expect(ch.putBuffer.getElementsArray()).toEqual([]);
    });

    describe('when the channel is closed', () => {
        it('should not put anything and reset the channel', async () => {
            const ch = makeChannel();
            close(ch);
            const { iterator } = testGeneratorRunner(put(ch, 'test1'));
            await iterator.next();
            await iterator.next();
            const result = await iterator.next();
            expect(result.done).toEqual(true);
            expect(ch.putBuffer.getElementsArray()).toEqual([]);
        });
    });

    describe('when the channel is closed after the item is put', () => {
        it('should release put', async () => {
            const ch = makeChannel();
            const { iterator } = testGeneratorRunner(put(ch, 'test1'));
            await iterator.next();
            await iterator.next();
            await iterator.next();
            close(ch);
            expect((await iterator.next()).done).toEqual(true);
            expect(ch.putBuffer.getElementsArray()).toEqual([]);
        });
    });

    describe('when the channel buffer size is more than 1', () => {
        describe('when there is no pending take', () => {
            it('should not block put if no take request is there', async () => {
                const ch = makeChannel(CreatableBufferType.DROPPING, 2);
                const { iterator } = testGeneratorRunner(put(ch, 'test1'));
                await iterator.next();
                await iterator.next();
                expect((await iterator.next()).done).toEqual(true);
            });

            describe('when the buffer is full', () => {
                it('should block put request if buffer is full', async () => {
                    const ch = makeChannel(CreatableBufferType.FIXED, 2);
                    const { iterator } = testGeneratorRunner(put(ch, 'test1'));
                    makePut(ch, 'test11');
                    makePut(ch, 'test12');
                    await iterator.next();
                    expect((await iterator.next()).done).toEqual(false);
                    releasePut(ch);
                    await iterator.next();
                    expect((await iterator.next()).done).toEqual(true);
                    expect(ch.putBuffer.getElementsArray()).toEqual([
                        'test12',
                        'test1',
                    ]);
                });
            });
        });
    });
});
