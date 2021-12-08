import { makeSlidingBuffer } from '@Lib/buffer/slidingBuffer';
import { makeDroppingBuffer } from '@Lib/buffer/droppingBuffer';
import { makeUnblockingBuffer } from '@Lib/buffer/unblockingBuffer';
import { makeFixedBuffer } from '@Lib/buffer/fixedBuffer';

describe('Buffer', () => {
    describe('makeFixedBuffer', () => {
        it('should add an item', () => {
            const buffer = makeFixedBuffer();
            buffer.add('sasagi');
            expect(buffer.collection.getElementsArray()).toEqual(['sasagi']);
        });

        it('should release first put item', () => {
            const buffer = makeFixedBuffer(2);
            buffer.add('sasagi');
            buffer.add('sasagi 2');
            buffer.release();
            expect(buffer.collection.getElementsArray()).toEqual(['sasagi 2']);
        });

        it('should preview first item without deleting it', () => {
            const buffer = makeFixedBuffer(2);
            buffer.add('sasagi');
            buffer.add('sasagi 2');
            expect(buffer.preview()).toEqual('sasagi');
            expect(buffer.collection.getElementsArray()).toEqual([
                'sasagi',
                'sasagi 2',
            ]);
        });

        describe('when full', () => {
            it('should not add an item', () => {
                const buffer = makeFixedBuffer(1);
                buffer.add('sasagi');
                buffer.add('sasagi 2');
                expect(buffer.collection.getElementsArray()).toEqual([
                    'sasagi',
                ]);
            });

            it('should be blocked', () => {
                const buffer = makeFixedBuffer(1);
                buffer.add('sasagi');
                expect(buffer.isBlocked()).toEqual(true);
            });
        });
    });

    describe('makeSlidingBuffer', () => {
        it('should add item', () => {
            const buffer = makeSlidingBuffer();
            buffer.add('sasagi');
            expect(buffer.collection.getElementsArray()).toEqual(['sasagi']);
        });

        it('should release first put item', () => {
            const buffer = makeSlidingBuffer(2);
            buffer.add('sasagi');
            buffer.add('sasagi 2');
            buffer.release();
            expect(buffer.collection.getElementsArray()).toEqual(['sasagi 2']);
        });

        it('should preview first put item', () => {
            const buffer = makeSlidingBuffer(2);
            buffer.add('sasagi');
            buffer.add('sasagi 2');
            expect(buffer.preview()).toEqual('sasagi');
            expect(buffer.collection.getElementsArray()).toEqual([
                'sasagi',
                'sasagi 2',
            ]);
        });

        describe('when full', () => {
            it('should not be blocked', () => {
                const buffer = makeSlidingBuffer();
                buffer.add('test1');
                expect(buffer.isBlocked()).toEqual(false);
            });

            describe('when adding an element', () => {
                it('should release first put item', () => {
                    const buffer = makeSlidingBuffer(2);
                    buffer.add('sasagi');
                    buffer.add('sasagi 2');
                    buffer.add('sasagi 3');
                    expect(buffer.collection.getElementsArray()).toEqual([
                        'sasagi 2',
                        'sasagi 3',
                    ]);
                });
            });
        });
    });

    describe('makeDroppingBuffer', () => {
        it('should add item', () => {
            const buffer = makeDroppingBuffer();
            buffer.add('sasagi');
            expect(buffer.collection.getElementsArray()).toEqual(['sasagi']);
        });

        it('should release first put item', () => {
            const buffer = makeDroppingBuffer(2);
            buffer.add('sasagi');
            buffer.add('sasagi 2');
            buffer.release();
            expect(buffer.collection.getElementsArray()).toEqual(['sasagi 2']);
        });

        it('should preview first put item', () => {
            const buffer = makeDroppingBuffer(2);
            buffer.add('sasagi');
            buffer.add('sasagi 2');
            expect(buffer.preview()).toEqual('sasagi');
            expect(buffer.collection.getElementsArray()).toEqual([
                'sasagi',
                'sasagi 2',
            ]);
        });

        describe('when full', () => {
            it('should not be blocked', () => {
                const buffer = makeDroppingBuffer(2);
                buffer.add('sasagi');
                buffer.add('sasagi 2');
                expect(buffer.isBlocked()).toEqual(false);
            });

            describe('when adding an item', () => {
                it('should drop the last put item', () => {
                    const buffer = makeDroppingBuffer(2);
                    buffer.add('sasagi');
                    buffer.add('sasagi 2');
                    buffer.add('sasagi 3');
                    expect(buffer.getElementsArray()).toEqual([
                        'sasagi',
                        'sasagi 2',
                    ]);
                });
            });
        });
    });

    describe('makeUnblockingBuffer', () => {
        it('should add item', () => {
            const buffer = makeUnblockingBuffer();
            buffer.add('sasagi');
            expect(buffer.collection.getElementsArray()).toEqual(['sasagi']);
        });

        it('should release first put item', () => {
            const buffer = makeUnblockingBuffer();
            buffer.add('sasagi');
            buffer.add('sasagi 2');
            buffer.release();
            expect(buffer.collection.getElementsArray()).toEqual(['sasagi 2']);
        });

        it('should preview first put item', () => {
            const buffer = makeUnblockingBuffer();
            buffer.add('sasagi');
            buffer.add('sasagi 2');
            expect(buffer.preview()).toEqual('sasagi');
            expect(buffer.collection.getElementsArray()).toEqual([
                'sasagi',
                'sasagi 2',
            ]);
        });

        describe('when full', () => {
            it('should not be blocked', () => {
                const buffer = makeUnblockingBuffer();
                buffer.add('sasagi');
                buffer.add('sasagi 2');
                expect(buffer.isBlocked()).toEqual(false);
            });

            describe('when adding an element', () => {
                it('should add item', () => {
                    const buffer = makeUnblockingBuffer();
                    buffer.add('sasagi');
                    buffer.add('sasagi 2');
                    buffer.add('sasagi 3');
                    expect(buffer.getElementsArray()).toEqual([
                        'sasagi',
                        'sasagi 2',
                        'sasagi 3',
                    ]);
                });
            });
        });
    });
});
