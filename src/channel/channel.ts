import { eventLoopQueue } from '@Lib/internal';

export function makeChannel<T = unknown>() {
    return {
        putQueue: [] as T[],
        takeQueue: [] as null[],

        makePut(data: T) {
            this.putQueue.push(data);
        },

        makeTake() {
            this.takeQueue.push(null);
        },

        releasePut() {
            return this.putQueue.shift();
        },

        releaseTake() {
            this.takeQueue.shift();
        },

        async waitForIncomingTake() {
            while (this.takeQueue.length === 0) {
                await eventLoopQueue();
            }
        },

        async waitForIncomingPut() {
            while (this.putQueue.length === 0) {
                await eventLoopQueue();
            }
        },

        async waitForPutQueueToRelease() {
            while (this.putQueue.length !== 0) {
                await eventLoopQueue();
            }
        },

        async waitForTakeQueueToRelease() {
            while (this.takeQueue.length !== 0) {
                await eventLoopQueue();
            }
        },

        // in order to put, you need to place an item into putQueue and wait for take to appear
        // after that you pop the item from putQueue
        async put(data: T) {
            await this.waitForPutQueueToRelease();
            this.makePut(data);
            await this.waitForIncomingTake();
        },

        // in order to take, you need to place an item into takequeue and wait for put to appear
        // after that you pop the item from takeQueue
        async take() {
            await this.waitForTakeQueueToRelease();
            this.makeTake();
            await this.waitForIncomingPut();
            this.releaseTake();
            return this.releasePut();
        },
    };
}
