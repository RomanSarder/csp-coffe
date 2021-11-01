import { makeChannel, Channel } from '@Lib/channel';
import { makePut } from '@Lib/operators/internal';
import { close } from '@Lib/operators';
import { Events } from './entity';
import { worker } from './worker/worker';
import { GeneratorReturn, MaybeGeneratorReturnFromValue } from './utils';

export function go<
    GenFn extends (...args1: readonly any[]) => Generator,
    Args extends Parameters<GenFn>,
    G extends Generator = ReturnType<GenFn>,
    TReturn = Exclude<MaybeGeneratorReturnFromValue<GeneratorReturn<G>>, void>,
>(
    generator: GenFn,
    ...args: Args
): {
    promise: Promise<TReturn | Events.CANCELLED>;
    channel: Channel<TReturn | Events.CANCELLED>;
    cancel: () => Promise<void>;
} {
    const channel = makeChannel<TReturn | Events.CANCELLED>();
    const { promise, iterator } = worker(generator, ...args);

    promise
        .then((res) => {
            makePut(channel, res);
            return res;
        })
        .catch((e) => {
            close(channel);
            throw e;
        });

    return {
        promise,
        channel,
        cancel: async () => {
            await iterator.return(Events.CANCELLED);
        },
    };
}
