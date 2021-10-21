import type { CancelledRef, GenReturn, GenT } from './go.types';
import { Events, Command } from './constants';
import { isInstruction } from './utils/isInstruction';

export function worker<
    G extends Generator,
    T = GenT<G>,
    TReturn = GenReturn<G>,
>(
    iterator: G,
    isCancelledRef: CancelledRef = { ref: false },
): Promise<TReturn | Events.CANCELLED> {
    function nextStep<ItRes extends IteratorYieldResult<T | TReturn>>(
        { value: nextIteratorValue, done }: ItRes,
        it: G,
        successCallback: (value: TReturn | Events.CANCELLED) => void,
        errorCallback: (value: any) => void,
    ): void {
        if (isCancelledRef.ref) {
            successCallback(Events.CANCELLED);
            return;
        }
        if (done) {
            successCallback(nextIteratorValue as TReturn);
        } else {
            if (isInstruction(nextIteratorValue)) {
                if (nextIteratorValue.command === Command.PARK) {
                    setImmediate(() => {
                        nextStep(
                            {
                                value: nextIteratorValue,
                                done: false,
                            },
                            it,
                            successCallback,
                            errorCallback,
                        );
                    });
                    return;
                }
                if (nextIteratorValue.command === Command.CONTINUE) {
                    setImmediate(() => {
                        nextStep(
                            it.next(
                                nextIteratorValue.value,
                            ) as IteratorYieldResult<T | TReturn>,
                            it,
                            successCallback,
                            errorCallback,
                        );
                    });
                    return;
                }
            }
            if (nextIteratorValue instanceof Promise) {
                nextIteratorValue
                    .then((result) => {
                        nextStep(
                            { value: result, done: false },
                            it,
                            successCallback,
                            errorCallback,
                        );
                    })
                    .catch((e) => {
                        errorCallback(e);
                    });
                return;
            }
            setTimeout(() => {
                nextStep(
                    it.next(nextIteratorValue) as IteratorYieldResult<
                        T | TReturn
                    >,
                    it,
                    successCallback,
                    errorCallback,
                );
            }, 0);
        }
    }

    return new Promise((resolve, reject) => {
        setImmediate(() => {
            nextStep(
                iterator.next() as IteratorYieldResult<T | TReturn>,
                iterator,
                resolve,
                reject,
            );
        });
    });
}
