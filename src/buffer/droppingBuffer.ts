import { makeBufferMixin } from './bufferMixin';
import { makeDroppingQueue } from './collection/droppingQueue';
import { BufferType } from './buffer.enum';
import { Buffer } from './buffer.types';

export const makeDroppingBuffer = <T = unknown>(capacity = 1): Buffer<T> => ({
    type: BufferType.DROPPING,
    ...makeBufferMixin<T>(makeDroppingQueue<T>(capacity)),
});
