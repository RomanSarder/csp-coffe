import type { GeneratorReturn } from '@Lib/shared/entity';
import { runIterator } from '@Lib/runner';

type GeneratorFn = (...args: readonly any[]) => any;

export function createAsyncWrapper<
    GenFn extends GeneratorFn,
    GenReturn = GeneratorReturn<ReturnType<GenFn>>,
>(genFn: GenFn) {
    return async (...args: Parameters<GenFn>): Promise<GenReturn> => {
        const result = await runIterator(genFn(...args));
        return result;
    };
}
