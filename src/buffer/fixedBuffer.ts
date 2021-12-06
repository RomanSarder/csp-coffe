import { makeBufferMixin } from './bufferMixin';
import { makeQueue } from './collection/queue';
import { BufferType } from './buffer.enum';
import { Buffer } from './buffer.types';

export const makeFixedBuffer = <T = unknown>(capacity = 1): Buffer<T> => ({
    type: BufferType.FIXED,
    ...makeBufferMixin<T>(makeQueue<T>(capacity)),
    isBlocked() {
        return this.collection.getSize() === capacity;
    },
    add(data: T) {
        if (!this.isBlocked()) {
            this.collection.add(data);
        }
    },
});
