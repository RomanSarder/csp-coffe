import { CreatableBufferType } from '@Lib/buffer';
import {
    makeChannel,
    close,
    makePutRequest,
    releasePut,
    push,
    pop,
} from '@Lib/channel';
import {
    integrationTestGeneratorRunner,
    unitTestGeneratorRunner,
} from '@Lib/testGeneratorRunner';
import { put } from '@Lib/operators';
import { PutBuffer, Values } from '@Lib/channel/entity/privateKeys';
import { putRequest } from '@Lib/channel/config';

describe('put', () => {
    it('should put a value to channel', async () => {
        const ch = makeChannel(CreatableBufferType.UNBLOCKING);
        const { next } = integrationTestGeneratorRunner(put(ch, 'test1'));
        await next();
        await next();
        await next();
        expect(ch[PutBuffer].getElementsArray()).toEqual([putRequest]);
        expect(ch[Values]).toEqual(['test1']);
    });

    it('should throw error if trying to put null', async () => {
        const ch = makeChannel();
        const { next } = integrationTestGeneratorRunner(put(ch, null));
        expect((await next()).error).toEqual(
            new Error('null values are not allowed'),
        );
        expect(ch[PutBuffer].getElementsArray()).toEqual([]);
        expect(ch[Values]).toEqual([]);
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
        it('should delete put request', async () => {
            const ch = makeChannel();
            const { next } = unitTestGeneratorRunner(put(ch, 'test1'));
            await next();
            await next();
            await next();
            close(ch);
            expect((await next()).done).toEqual(true);
            expect(ch[PutBuffer].getElementsArray()).toEqual([]);
            expect(ch[Values]).toEqual([]);
        });
    });

    describe('when the channel buffer size is more than 1', () => {
        describe('when there is no pending take request', () => {
            it('should not block put', async () => {
                const ch = makeChannel(CreatableBufferType.DROPPING, 2);
                const { next } = integrationTestGeneratorRunner(
                    put(ch, 'test1'),
                );
                await next();
                await next();
                expect((await next()).done).toEqual(true);
            });

            describe('when the buffer is full', () => {
                it('should block put request', async () => {
                    const ch = makeChannel(CreatableBufferType.FIXED, 2);
                    const { next } = unitTestGeneratorRunner(put(ch, 'test1'));
                    makePutRequest(ch);
                    push(ch, 'test11');
                    makePutRequest(ch);
                    push(ch, 'test12');
                    await next();
                    expect((await next()).done).toEqual(false);
                    releasePut(ch);
                    pop(ch);
                    await next();
                    expect((await next()).done).toEqual(true);
                    expect(ch[Values]).toEqual(['test12', 'test1']);
                    expect(ch[PutBuffer].getElementsArray()).toEqual([
                        putRequest,
                        putRequest,
                    ]);
                });
            });
        });
    });
});
