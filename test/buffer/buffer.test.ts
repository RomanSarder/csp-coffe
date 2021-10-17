import {
    makeSlidingBuffer,
    makeDroppingBuffer,
    makeUnblockingBuffer,
} from '@Lib/buffer';
import { makeFixedBuffer } from '@Lib/buffer/fixedBuffer';

describe('Buffer', () => {
    describe('makeFixedBuffer', () => {
        it('should add elements to contents array', () => {
            const buffer = makeFixedBuffer();
            buffer.add('sasagi');
            expect(buffer.collection.getElementsArray()).toEqual(['sasagi']);
        });

        it('should release first put element from contents', () => {
            const buffer = makeFixedBuffer(2);
            buffer.add('sasagi');
            buffer.add('sasagi 2');
            buffer.release();
            expect(buffer.collection.getElementsArray()).toEqual(['sasagi 2']);
        });

        describe('when full', () => {
            it('should not add', () => {
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
        it('should add elements to contents array', () => {
            const buffer = makeSlidingBuffer();
            buffer.add('sasagi');
            expect(buffer.collection.getElementsArray()).toEqual(['sasagi']);
        });

        it('should release first put element from contents', () => {
            const buffer = makeSlidingBuffer(2);
            buffer.add('sasagi');
            buffer.add('sasagi 2');
            buffer.release();
            expect(buffer.collection.getElementsArray()).toEqual(['sasagi 2']);
        });

        describe('when full', () => {
            it('should not be blocked', () => {
                const buffer = makeSlidingBuffer();
                buffer.add('test1');
                expect(buffer.isBlocked()).toEqual(false);
            });

            describe('when adding an element', () => {
                it('should release first put element', () => {
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
        it('should add elements to contents array', () => {
            const buffer = makeDroppingBuffer();
            buffer.add('sasagi');
            expect(buffer.collection.getElementsArray()).toEqual(['sasagi']);
        });

        it('should release first put element from contents', () => {
            const buffer = makeDroppingBuffer(2);
            buffer.add('sasagi');
            buffer.add('sasagi 2');
            buffer.release();
            expect(buffer.collection.getElementsArray()).toEqual(['sasagi 2']);
        });

        describe('when full', () => {
            it('should not be blocked', () => {
                const buffer = makeDroppingBuffer(2);
                buffer.add('sasagi');
                buffer.add('sasagi 2');
                expect(buffer.isBlocked()).toEqual(false);
            });

            describe('when adding an element', () => {
                it('should drop the latest put element from contents', () => {
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
        it('should add elements to contents array', () => {
            const buffer = makeUnblockingBuffer();
            buffer.add('sasagi');
            expect(buffer.collection.getElementsArray()).toEqual(['sasagi']);
        });

        it('should release first put element from contents', () => {
            const buffer = makeUnblockingBuffer();
            buffer.add('sasagi');
            buffer.add('sasagi 2');
            buffer.release();
            expect(buffer.collection.getElementsArray()).toEqual(['sasagi 2']);
        });

        describe('when full', () => {
            it('should not be blocked', () => {
                const buffer = makeUnblockingBuffer();
                buffer.add('sasagi');
                buffer.add('sasagi 2');
                expect(buffer.isBlocked()).toEqual(false);
            });

            describe('when adding an element', () => {
                it('should not drop element', () => {
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
