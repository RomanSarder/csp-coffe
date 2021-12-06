import { call } from '@Lib/go/instructions/call';
import { fakeAsyncFunction } from '@Lib/internal';
import { delay } from '@Lib/shared/utils/delay';
import { unitTestGeneratorRunner } from '@Lib/testGeneratorRunner';

describe('testGeneratorRunner', () => {
    it('TBD', async () => {
        function* innerGenerator(res: any) {
            yield 5;
            yield delay(100);
            return res;
        }

        function* testGenerator() {
            const result: number = yield fakeAsyncFunction(() => 10);
            expect(result).toEqual(10);
            const generatorYieldResult: number = yield innerGenerator(20);
            expect(generatorYieldResult).toEqual(20);
            const callYieldResult: number = yield call(innerGenerator, 50);
            expect(callYieldResult).toEqual(50);
        }

        const { next } = unitTestGeneratorRunner(testGenerator());

        expect(await next()).toEqual({ value: 10, done: false });
        expect(await next()).toEqual({ value: 5, done: false });
        expect(await next()).toEqual({ value: undefined, done: false });
        expect(await next()).toEqual({ value: 20, done: false });
        expect(await next()).toEqual({ value: 5, done: false });
        expect(await next()).toEqual({ value: undefined, done: false });
        expect(await next()).toEqual({ value: 50, done: false });
    });
});
