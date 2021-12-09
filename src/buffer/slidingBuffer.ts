import { makeBufferMixin } from './bufferMixin';
import { makeQueue } from './collection';
import { BufferType } from './entity/bufferType';
import type { Buffer } from './entity/buffer';

export const makeSlidingBuffer = <T = unknown>(capacity = 1): Buffer<T> => ({
    type: BufferType.SLIDING,
    ...makeBufferMixin<T>(makeQueue<T>(capacity)),
});
