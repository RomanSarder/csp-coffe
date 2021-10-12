import { go } from '@Lib/go';

function fakeAsyncFunction(callback: () => void) {
    return new Promise<void>((resolve) => {
        setTimeout(() => {
            callback();
            resolve();
        }, 100);
    });
}

describe('go', () => {
    it('should execute both sync and async yield statements in a correct order', async () => {
        const executionOrder = [] as number[];

        function* testGenerator() {
            yield executionOrder.push(1);
            yield fakeAsyncFunction(() => executionOrder.push(2));
            yield executionOrder.push(3);
        }

        const { promise } = go(testGenerator);

        await promise;

        expect(executionOrder).toEqual([1, 2, 3]);
    });

    it('should return the last yielded value', async () => {
        function* testGenerator() {
            yield fakeAsyncFunction(() => 'sasi');
            return 'test';
        }

        const { promise } = go(testGenerator);

        const result = await promise;

        expect(result).toEqual('test');
    });
});
