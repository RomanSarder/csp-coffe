import { CreatableBufferType } from '@Lib/buffer';
import { makeChannel } from '@Lib/channel';
import { asyncGeneratorProxy } from '@Lib/go/worker';
import { putGenerator, close } from '@Lib/operators';
import { makePut, releasePut } from '@Lib/operators/internal';

describe('put', () => {
    it('should put a value to channel', async () => {
        const ch = makeChannel();
        const iterator = asyncGeneratorProxy(putGenerator(ch, 'test1'));
        const result1 = await iterator.next();
        const result2 = await iterator.next(result1);
        await iterator.next(result2);
        expect(ch.putBuffer.getElementsArray()).toEqual(['test1']);
    });

    it('should throw error if trying to put null', async () => {
        const ch = makeChannel();
        const iterator = asyncGeneratorProxy(putGenerator(ch, null));
        expect(iterator.next()).rejects.toEqual(
            new Error('null values are not allowed'),
        );
        expect(ch.putBuffer.getElementsArray()).toEqual([]);
    });

    describe('when the channel is closed', () => {
        it('should not put anything and reset the channel', async () => {
            const ch = makeChannel();
            close(ch);
            const iterator = asyncGeneratorProxy(putGenerator(ch, 'test1'));
            const result1 = await iterator.next();
            await iterator.next(result1);
            expect(ch.putBuffer.getElementsArray()).toEqual([]);
        });
    });

    describe('when the channel is closed after the item is put', () => {
        it('should release put', async () => {
            const ch = makeChannel();
            const iterator = asyncGeneratorProxy(putGenerator(ch, 'test1'));
            const result1 = await iterator.next();
            const result2 = await iterator.next(result1);
            const result3 = await iterator.next(result2);
            close(ch);
            await iterator.next(result3);
            expect(ch.putBuffer.getElementsArray()).toEqual([]);
        });
    });

    describe('when the channel buffer size is more than 1', () => {
        describe('when there is no pending take', () => {
            it('should not block put if no take request is there', async () => {
                const ch = makeChannel(CreatableBufferType.DROPPING, 2);
                const iterator = asyncGeneratorProxy(putGenerator(ch, 'test1'));
                const result1 = await iterator.next();
                const result2 = await iterator.next(result1);
                expect((await iterator.next(result2)).done).toEqual(true);
            });

            describe('when the buffer is full', () => {
                it('should block put request if buffer is full', async () => {
                    const ch = makeChannel(CreatableBufferType.FIXED, 2);
                    const iterator = asyncGeneratorProxy(
                        putGenerator(ch, 'test1'),
                    );
                    makePut(ch, 'test11');
                    makePut(ch, 'test12');
                    const result1 = await iterator.next();
                    const result2 = await iterator.next(result1);
                    const result3 = await iterator.next(result2);
                    expect(result3.value).toEqual({
                        command: 'PARK',
                    });
                    releasePut(ch);
                    expect((await iterator.next(result3)).done).toEqual(true);
                    expect(ch.putBuffer.getElementsArray()).toEqual([
                        'test12',
                        'test1',
                    ]);
                });
            });
        });
    });
});
