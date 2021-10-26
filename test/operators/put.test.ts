import { CreatableBufferType } from '@Lib/buffer';
import { makeChannel } from '@Lib/channel';
import { syncWorker } from '@Lib/go/worker';
import { close, put } from '@Lib/operators';
import { makePut, releasePut } from '@Lib/operators/internal';

describe('put', () => {
    it('should put a value to channel', () => {
        const ch = makeChannel();
        const iterator = syncWorker(put(ch, 'test1'));
        iterator.next();
        iterator.next();
        iterator.next();
        expect(ch.putBuffer.getElementsArray()).toEqual(['test1']);
    });

    it('should throw error if trying to put null', () => {
        const ch = makeChannel();
        const iterator = syncWorker(put(ch, null));
        expect(() => {
            iterator.next();
        }).toThrowError('null values are not allowed');
        expect(ch.putBuffer.getElementsArray()).toEqual([]);
    });

    describe('when the channel is closed', () => {
        it('should not put anything and reset the channel', () => {
            const ch = makeChannel();
            close(ch);
            const iterator = syncWorker(put(ch, 'test1'));
            iterator.next();
            iterator.next();
            expect(ch.putBuffer.getElementsArray()).toEqual([]);
        });
    });

    describe('when the channel is closed after the item is put', () => {
        it('should release put', () => {
            const ch = makeChannel();
            const iterator = syncWorker(put(ch, 'test1'));
            iterator.next();
            iterator.next();
            iterator.next();
            close(ch);
            iterator.next();
            expect(ch.putBuffer.getElementsArray()).toEqual([]);
        });
    });

    describe('when the channel buffer size is more than 1', () => {
        describe('when there is no pending take', () => {
            it('should not block put if no take request is there', () => {
                const ch = makeChannel(CreatableBufferType.DROPPING, 2);
                const iterator = syncWorker(put(ch, 'test1'));
                iterator.next();
                iterator.next();
                expect(iterator.next().done).toEqual(true);
            });

            describe('when the buffer is full', () => {
                it('should block put request if buffer is full', () => {
                    const ch = makeChannel(CreatableBufferType.FIXED, 2);
                    const iterator = syncWorker(put(ch, 'test1'));
                    makePut(ch, 'test11');
                    makePut(ch, 'test12');
                    iterator.next();
                    iterator.next();
                    expect(iterator.next().value).toEqual({ command: 'PARK' });
                    releasePut(ch);
                    expect(iterator.next().done).toEqual(true);
                    expect(ch.putBuffer.getElementsArray()).toEqual([
                        'test12',
                        'test1',
                    ]);
                });
            });
        });
    });
});
