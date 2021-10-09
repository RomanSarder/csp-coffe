export const eventLoopQueue = () => {
    return new Promise<void>((resolve) =>
        setImmediate(() => {
            resolve();
        }),
    );
};
