import type { TypelessBuffer } from './entity/typelessBuffer';
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

        preview() {
            return this.collection.preview();
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
