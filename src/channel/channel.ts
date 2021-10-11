import { eventLoopQueue } from '@Lib/internal';
import { BufferType, makeBuffer } from '@Lib/buffer';
import type { Channel } from './channel.types';

export function makePut<T = unknown>(ch: Channel<T>, data: T) {
    ch.putBuffer.add(data);
}

export function makeTake<T = unknown>(ch: Channel<T>) {
    ch.takeBuffer.add(null);
}

export function releasePut<T = unknown>(ch: Channel<T>) {
    return ch.putBuffer.release();
}

export function releaseTake<T = unknown>(ch: Channel<T>) {
    ch.takeBuffer.release();
}

export async function waitForIncomingTake<T = unknown>(ch: Channel<T>) {
    while (ch.takeBuffer.getSize() === 0) {
        await eventLoopQueue();
    }
}

export async function waitForIncomingPut<T = unknown>(ch: Channel<T>) {
    while (ch.putBuffer.getSize() === 0) {
        await eventLoopQueue();
    }
}

export async function waitForPutQueueToRelease<T = unknown>(ch: Channel<T>) {
    while (ch.putBuffer.getSize() !== 0) {
        await eventLoopQueue();
    }
}

export async function waitForTakeQueueToRelease<T = unknown>(ch: Channel<T>) {
    while (ch.takeBuffer.getSize() !== 0) {
        await eventLoopQueue();
    }
}

export async function put<T = unknown>(ch: Channel<T>, data: T) {
    await waitForPutQueueToRelease(ch);
    makePut(ch, data);
    await waitForIncomingTake(ch);
}

export async function take<T = unknown>(ch: Channel<T>) {
    await waitForTakeQueueToRelease(ch);
    makeTake(ch);
    await waitForIncomingPut(ch);
    releaseTake(ch);
    return releasePut(ch);
}

export function makeChannel<T = unknown>(
    bufferType: BufferType = BufferType.DROPPING,
    capacity = 1,
): Channel<T> {
    return {
        putBuffer: makeBuffer<T>(bufferType, capacity),
        takeBuffer: makeBuffer(bufferType, capacity),
    };
}
