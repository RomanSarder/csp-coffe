import { makeBufferMixin } from './bufferMixin';
import { makeDroppingQueue } from './collection/droppingQueue';
import { BufferType } from './entity/bufferType';
import { Buffer } from './entity/buffer';

export const makeClosedBuffer = <T = unknown>(): Buffer<T> => ({
    type: BufferType.CLOSED,
    ...makeBufferMixin<T>(makeDroppingQueue<T>(0)),
    isBlocked() {
        return true;
    },
});
