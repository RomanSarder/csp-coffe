import { makeBufferWithCollection } from './makeBufferWithCollection';
import { makeQueue } from './collection';
import { Buffer } from './buffer.types';

export const makeFixedBuffer = <T = unknown>(capacity = 1): Buffer<T> => ({
    ...makeBufferWithCollection<T>(makeQueue<T>(capacity)),
    isBlocked() {
        return this.collection.getSize() === capacity;
    },
    add(data: T) {
        if (!this.isBlocked()) {
            this.collection.add(data);
        }
    },
});
