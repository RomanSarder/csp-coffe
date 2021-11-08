import { v4 as uuid } from 'uuid';

import { BufferType, CreatableBufferType, makeBuffer } from '@Lib/buffer';
import type { Channel } from './channel.types';
import { DEFAULT_CHANNEL_CONFIG } from './constants';
import { close } from '../operators';

function isChannelBuffered(bufferType: CreatableBufferType, capacity: number) {
    if (bufferType === CreatableBufferType.UNBLOCKING || capacity > 1) {
        return true;
    }
    return false;
}

export function makeChannel<T = NonNullable<any>>(
    bufferType = DEFAULT_CHANNEL_CONFIG.bufferType,
    capacity = 1,
): Channel<T> {
    const result: Channel<T> = {
        id: uuid(),
        capacity,
        isBuffered: isChannelBuffered(bufferType, capacity),
        isClosed: false,
        putBuffer: makeBuffer<T>(bufferType, capacity),
        takeBuffer: makeBuffer(BufferType.FIXED, 1),

        is(ch: Channel<unknown>) {
            return this.id === ch.id;
        },
    };

    Object.defineProperty(result, 'id', {
        configurable: false,
        writable: false,
    });

    return result;
}

export function makeTimeoutChannel<T = NonNullable<unknown>>(
    ms: number,
    bufferType = DEFAULT_CHANNEL_CONFIG.bufferType,
    capacity = 1,
) {
    const ch = makeChannel<T>(bufferType, capacity);

    const timeout = setTimeout(() => {
        close(ch);
        clearTimeout(timeout);
    }, ms);

    return ch;
}
