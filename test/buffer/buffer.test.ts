import { makeSlidingBuffer, makeDroppingBuffer } from '@Lib/buffer';

describe('Buffer', () => {
    describe('makeSlidingBuffer', () => {
        it('should add elements to contents array', () => {
            const buffer = makeSlidingBuffer();
            buffer.add('sasagi');
            expect(buffer.collection.getElementsArray()).toEqual(['sasagi']);
        });

        it('should release first put element from contents', () => {
            const buffer = makeSlidingBuffer(1);
            buffer.add('sasagi');
            buffer.add('sasagi 2');
            expect(buffer.collection.getElementsArray()).toEqual(['sasagi 2']);
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
    });
});
