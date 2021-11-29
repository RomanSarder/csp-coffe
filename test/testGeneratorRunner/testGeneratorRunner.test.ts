import { call } from '@Lib/go';
import { fakeAsyncFunction } from '@Lib/internal';
import { delay } from '@Lib/shared/utils/delay';
import { testGeneratorRunner } from '@Lib/testGeneratorRunner';

/* TODO: Think of the ways to reuse asyncGeneratorProxy for unit tests
/* Ignore spawn and fork commands
/* Add call instructions handling
/* Add next(arg) passing */

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

        const { next } = testGeneratorRunner(testGenerator());

        console.log(await next());
        console.log(await next());
    });
});
