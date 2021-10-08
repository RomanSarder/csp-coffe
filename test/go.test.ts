import { go } from '@Lib/go';

function fakeAsync(anything: unknown) {
    return new Promise<unknown>((resolve) => {
        setTimeout(() => {
            resolve(anything);
        }, 1000);
    });
}

describe('runIterator', () => {
    it('it should properly run an iterator', async () => {
        function* testGenerator() {
            const result1: string = yield 'thunky thunk';
            const result2: string = yield fakeAsync('async thingy');
            const result3: string = yield 'HAHA';

            return {
                result1,
                result2,
                result3,
            };
        }

        const { promise } = go(testGenerator);
        const result = (await promise) as {
            result1: string;
            result2: string;
            result3: string;
        };
        expect(result.result1).toEqual('thunky thunk');
        expect(result.result2).toEqual('async thingy');
        expect(result.result3).toEqual('HAHA');
    });
});
