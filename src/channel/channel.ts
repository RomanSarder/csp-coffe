export const eventLoopQueue = () => {
    return new Promise<void>((resolve) =>
        setImmediate(() => {
            resolve();
        }),
    );
};

export function makeChannel() {
    return {
        putQueue: [] as unknown[],
        takeQueue: [] as unknown[],

        async waitForTake() {
            while (this.takeQueue.length === 0) {
                await eventLoopQueue();
            }
        },

        async waitForPut() {
            while (this.putQueue.length === 0) {
                await eventLoopQueue();
            }
        },
    };
}
