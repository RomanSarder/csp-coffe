import { makeChannel, Channel } from '@Lib/channel';
import { makePut } from '@Lib/operators/internal';
import { close } from '@Lib/operators';
import { createCancellableTask } from '@Lib/cancellableTask';
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
    const cancellablePromise = createCancellableTask({
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
