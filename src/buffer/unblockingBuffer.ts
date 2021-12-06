import { makeBufferMixin } from './bufferMixin';
import { makeQueue } from './collection/queue';
import { BufferType } from './entity/bufferType';
import { Buffer } from './entity/buffer';

export const makeUnblockingBuffer = <T = unknown>(): Buffer<T> => ({
    type: BufferType.UNBLOCKING,
    ...makeBufferMixin<T>(makeQueue<T>(null)),
    isBlocked() {
        return false;
    },
});
