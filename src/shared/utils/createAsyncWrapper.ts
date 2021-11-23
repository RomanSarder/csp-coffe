import { GeneratorReturn } from '@Lib/go';
import { createRunner } from '@Lib/runner';

type GeneratorFn = (...args: readonly any[]) => any;

export function createAsyncWrapper<
    GenFn extends GeneratorFn,
    GenReturn = GeneratorReturn<ReturnType<GenFn>>,
>(genFn: GenFn) {
    return (...args: Parameters<GenFn>): Promise<GenReturn> => {
        return createRunner(genFn(...args));
    };
}
