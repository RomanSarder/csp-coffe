import { Events, CancelledRef } from '../entity';
import { nextStep } from './nextStep';
import {
    GeneratorReturn,
    GeneratorT,
    MaybeGeneratorReturnFromValue,
} from '../utils';

export function worker<
    G extends Generator,
    T = GeneratorT<G>,
    TReturn = MaybeGeneratorReturnFromValue<GeneratorReturn<G>>,
>(
    iterator: G,
    isCancelledRef: CancelledRef = { ref: false },
): Promise<TReturn | Events.CANCELLED> {
    return new Promise((resolve, reject) => {
        nextStep({
            nextIteratorResult: iterator.next() as IteratorYieldResult<
                T | TReturn
            >,
            iterator,
            isCancelledRef,
            successCallback: resolve,
            errorCallback: reject,
        });
    });
}
