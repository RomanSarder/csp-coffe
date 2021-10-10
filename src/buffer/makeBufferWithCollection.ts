import type { Buffer } from './buffer.types';
import type { Collection } from './collection';

export function makeBufferWithCollection<T = unknown>(
    collection: Collection<T>,
): Buffer<T> {
    return {
        collection,

        add(data: T) {
            this.collection.add(data);
        },

        release() {
            this.collection.release();
        },
    };
}
