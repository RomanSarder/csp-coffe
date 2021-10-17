import { makeBufferMixin } from './bufferMixin';
import { makeQueue } from './collection';
import { BufferType } from './buffer.enum';
import { Buffer } from './buffer.types';

export const makeSlidingBuffer = <T = unknown>(capacity = 1): Buffer<T> => ({
    type: BufferType.SLIDING,
    ...makeBufferMixin<T>(makeQueue<T>(capacity)),
});
