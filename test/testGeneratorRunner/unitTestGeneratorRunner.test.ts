import { call } from '@Lib/operators';
import { fakeAsyncFunction } from '@Lib/shared/utils';
import { delay } from '@Lib/shared/utils/delay';
import { unitTestGeneratorRunner } from '@Lib/testGeneratorRunner';

describe('testGeneratorRunner', () => {
    describe('unitTestGeneratorRunner', () => {
        it('should run a generator', async () => {
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
});
