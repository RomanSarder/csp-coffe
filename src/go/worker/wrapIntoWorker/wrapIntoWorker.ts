import { Events } from '@Lib/go';
import { GeneratorReturn, MaybeGeneratorReturnFromValue } from '@Lib/go/utils';
import { worker } from '..';

export function wrapIntoWorker<
    P extends readonly any[],
    G extends Generator,
    TReturn = MaybeGeneratorReturnFromValue<GeneratorReturn<G>>,
>(
    generatorFunction: (...args: P) => G,
): (...args: P) => Promise<TReturn | Events.CANCELLED> {
    return (...params: P) => {
        return worker(generatorFunction, ...params).promise;
    };
}
