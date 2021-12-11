import { v4 as uuid } from 'uuid';

import { BufferType, CreatableBufferType, makeBuffer } from '@Lib/buffer';
import { takeAsync } from '@Lib/operators';
import type { Channel } from './entity/channel';
import { DefaultChannelConfig } from './config';
import { Events } from './entity/events';
import type { PutRequest } from './entity/putRequest';
import { PutBuffer, TakeBuffer, Values } from './entity/privateKeys';
import { close } from './utils/close';

function isChannelBuffered(bufferType: CreatableBufferType, capacity: number) {
    if (bufferType === CreatableBufferType.UNBLOCKING || capacity > 1) {
        return true;
    }
    return false;
}

export function makeChannel<T = NonNullable<any>>(
    bufferType = DefaultChannelConfig.bufferType,
    capacity = 1,
): Channel<T> {
    const result: Channel<T> = {
        id: uuid(),
        capacity,
        isBuffered: isChannelBuffered(bufferType, capacity),
        isClosed: false,
        [Values]: [],
        [PutBuffer]: makeBuffer<PutRequest>(bufferType, capacity),
        [TakeBuffer]: makeBuffer(BufferType.FIXED, 1),

        is(ch: Channel<unknown>) {
            return this.id === ch.id;
        },

        async *[Symbol.asyncIterator]() {
            while (!this.isClosed) {
                yield await takeAsync(this);
            }

            return Events.CHANNEL_CLOSED;
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
    bufferType = DefaultChannelConfig.bufferType,
    capacity = 1,
) {
    const ch = makeChannel<T>(bufferType, capacity);

    const timeout = setTimeout(() => {
        close(ch);
        clearTimeout(timeout);
    }, ms);

    return ch;
}
