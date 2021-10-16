import { eventLoopQueue } from '@Lib/internal';
import { BufferType, makeBuffer } from '@Lib/buffer';
import type { Channel } from './channel.types';
import { errorMessages, events } from './constants';

function isChannelClosedError(e: unknown) {
    return e instanceof Error && e.message === errorMessages.CHANNEL_CLOSED;
}

export function makePut<T = unknown>(ch: Channel<T>, data: T) {
    if (data === null) {
        throw new Error('null values are not allowed');
    }

    ch.putBuffer.add(data);
}

export function makeTake<T = unknown>(ch: Channel<T>) {
    ch.takeBuffer.add(null);
}

export function releasePut<T = unknown>(ch: Channel<T>): T | undefined {
    return ch.putBuffer.release();
}

export function releaseTake<T = unknown>(ch: Channel<T>) {
    ch.takeBuffer.release();
}

export async function waitForIncomingTake<T = unknown>(ch: Channel<T>) {
    if (ch.isClosed) {
        throw new Error(errorMessages.CHANNEL_CLOSED);
    }

    while (ch.takeBuffer.getSize() === 0) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        await eventLoopQueue();
    }
}

export async function waitForIncomingPut<T = unknown>(ch: Channel<T>) {
    if (ch.isClosed) {
        throw new Error(errorMessages.CHANNEL_CLOSED);
    }

    while (ch.putBuffer.getSize() === 0) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        await eventLoopQueue();
    }
}

export async function waitForPutQueueToRelease<T = unknown>(ch: Channel<T>) {
    if (ch.isClosed) {
        throw new Error(errorMessages.CHANNEL_CLOSED);
    }

    while (ch.putBuffer.isBlocked()) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        await eventLoopQueue();
    }
}

export async function waitForTakeQueueToRelease<T = unknown>(ch: Channel<T>) {
    if (ch.isClosed) {
        throw new Error(errorMessages.CHANNEL_CLOSED);
    }

    while (ch.takeBuffer.isBlocked()) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }

        await eventLoopQueue();
    }
}

function resetChannel<T = unknown>(ch: Channel<T>) {
    // eslint-disable-next-line no-param-reassign
    ch.putBuffer = makeBuffer<T>(BufferType.CLOSED);
    // eslint-disable-next-line no-param-reassign
    ch.takeBuffer = makeBuffer<null>(BufferType.CLOSED);
    // eslint-disable-next-line no-param-reassign
    ch.isClosed = true;
    // eslint-disable-next-line no-param-reassign
    ch.isBuffered = false;
}

export async function put<T = unknown>(ch: Channel<T>, data: T) {
    if (data === null) {
        throw new Error('null values are not allowed');
    }

    try {
        await waitForPutQueueToRelease(ch);
        makePut(ch, data);

        if (!ch.isBuffered) {
            try {
                await waitForIncomingTake(ch);
            } catch (e) {
                if (isChannelClosedError(e)) {
                    resetChannel(ch);
                }

                throw e;
            }
        }
    } catch (e) {
        if (!isChannelClosedError(e)) {
            throw e;
        }
    }
}

export async function take<T = unknown>(ch: Channel<T>) {
    try {
        await waitForTakeQueueToRelease(ch);
        makeTake(ch);

        try {
            await waitForIncomingPut(ch);
        } catch (e) {
            // If channel closed, cleanup made take
            if (isChannelClosedError(e)) {
                resetChannel(ch);
            }

            throw e;
        }
        releaseTake(ch);
        return releasePut(ch);
    } catch (e) {
        if (isChannelClosedError(e)) {
            return events.CHANNEL_CLOSED;
        }
        throw e;
    }
}

export function close<T = unknown>(ch: Channel<T>) {
    // eslint-disable-next-line no-param-reassign
    ch.isClosed = true;
}

export function makeChannel<T = unknown>(
    bufferType: Exclude<BufferType, 'CLOSED'> = BufferType.FIXED,
    capacity = 1,
): Channel<T> {
    return {
        capacity,
        isBuffered: capacity > 1,
        isClosed: false,
        putBuffer: makeBuffer<T>(bufferType, capacity),
        takeBuffer: makeBuffer(BufferType.FIXED, 1),
        async *[Symbol.asyncIterator]() {
            while (!this.isClosed && this.putBuffer.getSize() <= capacity) {
                const result = (await take<T>(this)) as string | T;
                yield result;
                await eventLoopQueue();
            }

            return events.CHANNEL_CLOSED;
        },
    };
}
