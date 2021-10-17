import { makeBufferWithCollection } from './makeBufferWithCollection';
import { makeQueue } from './collection';
import { Buffer } from './buffer.types';

export const makeUnblockingBuffer = <T = unknown>(): Buffer<T> => ({
    ...makeBufferWithCollection<T>(makeQueue<T>(null)),
    isBlocked() {
        return false;
    },
});
