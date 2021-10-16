import { BufferType } from '@Lib/buffer';
import { makeChannel } from '@Lib/channel';
import { close, put } from '@Lib/channel/operators';
import { makePut, makeTake, releasePut } from '@Lib/channel/operators/internal';
import { eventLoopQueue } from '@Lib/internal';

describe('put', () => {
    it('should put a value to channel', async () => {
        const ch = makeChannel();
        const spy = jest.fn();
        put(ch, 'test1').then(spy);
        await eventLoopQueue();
        expect(ch.putBuffer.getElementsArray()[0]).toEqual('test1');
        await eventLoopQueue();
        makeTake(ch);
        await eventLoopQueue();
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('should throw error if trying to put null', async () => {
        const ch = makeChannel();

        await expect(put(ch, null)).rejects.toEqual(
            new Error('null values are not allowed'),
        );
    });

    describe('when the channel is closed', () => {
        it('should not put anytrhing', async () => {
            const ch = makeChannel();
            close(ch);

            await put(ch, 'test1');

            expect(ch.putBuffer.getElementsArray()).toEqual([]);
        });
    });

    describe('when the channel is closed after the item is put', () => {
        it('should release put', async () => {
            const ch = makeChannel();
            const spy = jest.fn();
            put(ch, 'test1').then(spy);
            close(ch);
            await eventLoopQueue();
            expect(ch.putBuffer.getSize()).toEqual(0);
        });
    });

    describe('when the channel buffer size is more than 1', () => {
        describe('when there is no pending take', () => {
            it('should not block put if no take request is there', async () => {
                const ch = makeChannel(BufferType.DROPPING, 2);
                const spy = jest.fn();
                put(ch, 'test1').then(spy);
                await eventLoopQueue();
                expect(spy).toHaveBeenCalledTimes(1);
            });

            describe('when the buffer is full', () => {
                it('should block put request if buffer is full', async () => {
                    const ch = makeChannel(BufferType.FIXED, 2);
                    const spy = jest.fn();
                    makePut(ch, 'test11');
                    makePut(ch, 'test12');
                    put(ch, 'test1').then(spy);
                    await eventLoopQueue();
                    expect(spy).not.toHaveBeenCalled();
                    releasePut(ch);
                    await eventLoopQueue();
                    expect(spy).toHaveBeenCalledTimes(1);
                });
            });
        });
    });
});
