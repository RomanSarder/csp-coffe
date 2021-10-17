import type { TypelessBuffer } from './buffer.types';
import type { Collection } from './collection';

export function makeBufferMixin<T = unknown>(
    collection: Collection<T>,
): TypelessBuffer<T> {
    return {
        collection,

        add(data: T) {
            this.collection.add(data);
        },

        release() {
            return this.collection.release();
        },

        getSize() {
            return this.collection.getSize();
        },

        getElementsArray() {
            return this.collection.getElementsArray();
        },

        isBlocked() {
            return false;
        },
    };
}
