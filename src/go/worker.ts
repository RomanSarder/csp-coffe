import { Events, Command, CancelledRef } from './entity';
import { isInstruction } from './utils/isInstruction';
import {
    GeneratorReturn,
    GeneratorT,
    MaybeGeneratorReturnFromValue,
} from './utils';

function isGenerator(value: any | Generator): value is Generator {
    return (
        typeof value === 'object' &&
        value !== null &&
        typeof value[Symbol.iterator] === 'function'
    );
}

export function worker<
    G extends Generator,
    T = GeneratorT<G>,
    TReturn = MaybeGeneratorReturnFromValue<GeneratorReturn<G>>,
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
        console.log('nextValue', nextIteratorValue, done);
        if (isCancelledRef.ref) {
            successCallback(Events.CANCELLED);
            return;
        }

        if (isGenerator(nextIteratorValue)) {
            console.log('is generator', nextIteratorValue.next);
            setImmediate(() => {
                nextStep(
                    {
                        done: false,
                        value: worker(nextIteratorValue, isCancelledRef),
                    } as unknown as IteratorYieldResult<T | TReturn>,
                    it,
                    successCallback,
                    errorCallback,
                );
            });
        } else if (done) {
            successCallback(nextIteratorValue as TReturn);
        } else {
            if (isInstruction(nextIteratorValue)) {
                console.log('is instruction');
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

                if (nextIteratorValue.command === Command.EXECUTE) {
                    const nextIterator = nextIteratorValue.value as Extract<
                        T,
                        Generator
                    >;

                    setImmediate(() => {
                        nextStep(
                            it.next(
                                worker(nextIterator, isCancelledRef),
                            ) as IteratorYieldResult<T | TReturn>,
                            it,
                            successCallback,
                            errorCallback,
                        );
                    });
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
