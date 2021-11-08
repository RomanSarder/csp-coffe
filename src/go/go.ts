import { makeChannel, Channel } from '@Lib/channel';
import { makePut } from '@Lib/operators/internal';
import { close } from '@Lib/operators';
import { CANCEL, createCancellableTask } from '@Lib/cancellableTask';
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
    task: Promise<TReturn | Events.CANCELLED>;
    channel: Channel<TReturn | Events.CANCELLED>;
    cancel: () => Promise<void>;
} {
    const channel = makeChannel<TReturn | Events.CANCELLED>();
    const cancellableTask = createCancellableTask({ fn: generator, args });

    cancellableTask
        .then((res) => {
            makePut(channel, res);
            return res;
        })
        .catch((e) => {
            close(channel);
            throw e;
        });

    return {
        task: cancellableTask,
        channel,
        cancel: async () => {
            return cancellableTask[CANCEL]();
        },
    };
}
