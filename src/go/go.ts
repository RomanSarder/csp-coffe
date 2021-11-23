import { Channel } from '@Lib/channel/channel.types';
import { makeChannel } from '@Lib/channel/channel';
import { makePut } from '@Lib/operators/internal/makePut';
import { close } from '@Lib/operators/close';
import { createCoroutine } from '@Lib/coroutine';
import { CancellablePromise } from '@Lib/cancellablePromise';
import { Events } from './entity';
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
    cancellablePromise: CancellablePromise<TReturn | Events.CANCELLED>;
    channel: Channel<TReturn | Events.CANCELLED>;
} {
    const channel = makeChannel<TReturn | Events.CANCELLED>();
    const cancellablePromise = createCoroutine({
        iterator: generator(...args),
    });

    return {
        cancellablePromise: cancellablePromise
            .then((res) => {
                makePut(channel, res);
                return res;
            })
            .catch((e) => {
                close(channel);
                throw e;
            }),
        channel,
    };
}
