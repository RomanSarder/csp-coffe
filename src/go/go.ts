export function go(generator: () => Generator): {
    promise: Promise<unknown>;
} {
    const iterator = generator();

    function nextStep(resolvedValue: unknown): any {
        const { value: nextIteratorValue, done } = iterator.next(resolvedValue);

        if (done) return nextIteratorValue;

        if (nextIteratorValue instanceof Promise) {
            return nextIteratorValue.then(nextStep);
        }

        return Promise.resolve(nextIteratorValue).then(nextStep);
    }

    return {
        promise: Promise.resolve().then(nextStep),
    };
}
