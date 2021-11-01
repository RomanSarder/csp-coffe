import { eventLoopQueue } from '@Lib/internal';
import { Events } from '../entity';
import {
    GeneratorNext,
    GeneratorReturn,
    GeneratorT,
    MaybeGeneratorReturnFromValue,
} from '../utils';
import { asyncGeneratorProxy } from './asyncGeneratorProxy';

export function worker<
    GenFn extends (...args1: readonly any[]) => Generator,
    G extends ReturnType<GenFn>,
    TReturn = MaybeGeneratorReturnFromValue<GeneratorReturn<G>>,
>(
    generator: (...args2: any) => G,
    ...args: Parameters<GenFn>
): {
    promise: Promise<TReturn | Events.CANCELLED>;
    iterator: AsyncGenerator<
        GeneratorT<G>,
        GeneratorNext<G>,
        GeneratorReturn<G>
    >;
} {
    const asyncIterator = asyncGeneratorProxy(generator(...args));
    return {
        iterator: asyncIterator as AsyncGenerator<
            GeneratorT<G>,
            GeneratorNext<G>,
            GeneratorReturn<G>
        >,
        promise: (async function run() {
            /* Provide an ability to cancel immediately */
            await eventLoopQueue();
            let nextIteratorResult = await asyncIterator.next();
            while (!nextIteratorResult.done) {
                const result = await asyncIterator.next(
                    nextIteratorResult.value,
                );

                if (result.value === Events.CANCELLED) {
                    return result.value;
                }

                nextIteratorResult = result;
            }
            return nextIteratorResult.value;
        })(),
    };
}
