import { BufferType } from './buffer.enum';
import { makeClosedBuffer } from './closedBuffer';
import { makeDroppingBuffer } from './droppingBuffer';
import { makeSlidingBuffer } from './slidingBuffer';
import { Buffer } from './buffer.types';
import { makeFixedBuffer } from './fixedBuffer';

const bufferTypeToMakeFn = {
    [BufferType.DROPPING]: makeDroppingBuffer,
    [BufferType.SLIDING]: makeSlidingBuffer,
    [BufferType.CLOSED]: makeClosedBuffer,
    [BufferType.FIXED]: makeFixedBuffer,
};

export function makeBuffer<T = unknown>(
    bufferType: BufferType,
    capacity = 1,
): Buffer<T> {
    return bufferTypeToMakeFn[bufferType]<T>(capacity);
}
