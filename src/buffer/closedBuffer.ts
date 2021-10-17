import { makeBufferMixin } from './bufferMixin';
import { makeDroppingQueue } from './collection';
import { BufferType } from './buffer.enum';
import { Buffer } from './buffer.types';

export const makeClosedBuffer = <T = unknown>(): Buffer<T> => ({
    type: BufferType.CLOSED,
    ...makeBufferMixin<T>(makeDroppingQueue<T>(0)),
    isBlocked() {
        return true;
    },
});
