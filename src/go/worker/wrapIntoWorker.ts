import { GeneratorReturn, MaybeGeneratorReturnFromValue } from '../utils';
import { Events } from '../entity';
import { worker } from './worker';

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
