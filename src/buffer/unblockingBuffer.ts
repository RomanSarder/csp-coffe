import { makeBufferMixin } from './bufferMixin';
import { makeQueue } from './collection';
import { BufferType } from './buffer.enum';
import { Buffer } from './buffer.types';

export const makeUnblockingBuffer = <T = unknown>(): Buffer<T> => ({
    type: BufferType.UNBLOCKING,
    ...makeBufferMixin<T>(makeQueue<T>(null)),
    isBlocked() {
        return false;
    },
});
