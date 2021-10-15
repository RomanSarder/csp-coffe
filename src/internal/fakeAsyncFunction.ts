export function fakeAsyncFunction(callback: () => void) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            callback();
            resolve();
        }, 100);
    });
}
