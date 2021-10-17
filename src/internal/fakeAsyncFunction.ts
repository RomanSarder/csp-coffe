export function fakeAsyncFunction(callback: () => void) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            resolve(callback());
        }, 100);
    });
}
