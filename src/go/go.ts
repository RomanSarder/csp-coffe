import { makeChannel, Channel } from '@Lib/channel';
import { close } from '@Lib/operators';
import type { CancelledRef, Instruction } from './go.types';
import { Events, Command } from './constants';
import { isInstruction } from './utils/isInstruction';

export function go<
    T extends any | Instruction,
    TReturn extends any | Events.CANCELLED,
    TNext extends any | Instruction,
    G extends Generator<T, TReturn, TNext>,
>(
    generator: () => G,
    isCancelledRef: CancelledRef = { ref: false },
): {
    promise: Promise<TReturn>;
    channel: Channel<TReturn>;
    cancel: () => void;
} {
    const iterator = generator();
    const channel = makeChannel<TReturn>();

    function nextStep(
        {
            value: nextIteratorValue,
            done,
        }: IteratorResult<T | Instruction, TReturn>,
        it: G,
        successCallback: (value: TReturn) => void,
        errorCallback: (value: any) => void,
    ): void {
        if (isCancelledRef.ref) {
            successCallback(Events.CANCELLED as TReturn);
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
                            it.next(nextIteratorValue.value as TNext),
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
                        close(channel);
                        throw e;
                    });
                return;
            }
            setTimeout(() => {
                nextStep(
                    it.next(nextIteratorValue as TNext),
                    it,
                    successCallback,
                    errorCallback,
                );
            }, 0);
        }
    }

    return {
        promise: new Promise((resolve, reject) => {
            setImmediate(() => {
                nextStep(iterator.next(), iterator as G, resolve, reject);
            });
        }),
        channel,
        cancel: () => {
            // eslint-disable-next-line no-param-reassign
            isCancelledRef.ref = true;
        },
    };
}
