import { BufferType } from './buffer.enum';
import { makeClosedBuffer } from './closedBuffer';
import { makeDroppingBuffer } from './droppingBuffer';
import { makeSlidingBuffer } from './slidingBuffer';

const bufferTypeToMakeFn = {
    [BufferType.DROPPING]: makeDroppingBuffer,
    [BufferType.SLIDING]: makeSlidingBuffer,
    [BufferType.CLOSED]: makeClosedBuffer,
};

export function makeBuffer<T = unknown>(bufferType: BufferType, capacity = 1) {
    return bufferTypeToMakeFn[bufferType]<T>(capacity);
}
