import { makeChannel, Channel } from '@Lib/channel';
import { makePut } from '@Lib/operators/internal';
import { close } from '@Lib/operators';
import { CancelledRef, Events } from './entity';
import { worker } from './worker/worker';
import { GeneratorReturn, MaybeGeneratorReturnFromValue } from './utils';

export function go<
    GenFn extends () => Generator,
    G extends Generator = ReturnType<GenFn>,
    TReturn = Exclude<MaybeGeneratorReturnFromValue<GeneratorReturn<G>>, void>,
>(
    generator: GenFn,
    isCancelledRef: CancelledRef = { ref: false },
): {
    promise: Promise<TReturn | Events.CANCELLED>;
    channel: Channel<TReturn | Events.CANCELLED>;
    cancel: () => void;
} {
    const iterator = generator() as G;
    const channel = makeChannel<TReturn | Events.CANCELLED>();

    return {
        promise: worker(iterator, isCancelledRef)
            .then((res) => {
                makePut(channel, res);
                return res;
            })
            .catch((e) => {
                close(channel);
                throw e;
            }),
        channel,
        cancel: () => {
            // eslint-disable-next-line no-param-reassign
            isCancelledRef.ref = true;
        },
    };
}
