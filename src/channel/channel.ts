import { eventLoopQueue } from '@Lib/internal';
import type { Channel } from './channel.types';

export function makePut<T = unknown>(ch: Channel<T>, data: T) {
    ch.putQueue.push(data);
}

export function makeTake(ch: Channel) {
    ch.takeQueue.push(null);
}

export function releasePut(ch: Channel) {
    return ch.putQueue.shift();
}

export function releaseTake(ch: Channel) {
    ch.takeQueue.shift();
}

export async function waitForIncomingTake(ch: Channel) {
    while (ch.takeQueue.length === 0) {
        await eventLoopQueue();
    }
}

export async function waitForIncomingPut(ch: Channel) {
    while (ch.putQueue.length === 0) {
        await eventLoopQueue();
    }
}

export async function waitForPutQueueToRelease(ch: Channel) {
    while (ch.putQueue.length !== 0) {
        await eventLoopQueue();
    }
}

export async function waitForTakeQueueToRelease(ch: Channel) {
    while (ch.takeQueue.length !== 0) {
        await eventLoopQueue();
    }
}

// in order to put, you need to place an item into putQueue and wait for take to appear
// after that you pop the item from putQueue
export async function put<T = unknown>(ch: Channel<T>, data: T) {
    await waitForPutQueueToRelease(ch);
    makePut(ch, data);
    await waitForIncomingTake(ch);
}

// in order to take, you need to place an item into takequeue and wait for put to appear
// after that you pop the item from takeQueue
export async function take(ch: Channel) {
    await waitForTakeQueueToRelease(ch);
    makeTake(ch);
    await waitForIncomingPut(ch);
    releaseTake(ch);
    return releasePut(ch);
}

export function makeChannel<T = unknown>(): Channel {
    return {
        putQueue: [] as T[],
        takeQueue: [] as null[],
    };
}
