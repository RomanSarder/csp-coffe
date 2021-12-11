import type { Channel } from '@Lib/channel';
import { makeChannel, closeOnAllValuesTaken } from '@Lib/channel';
import { makePutRequest, close } from '@Lib/operators';
import type { CancellablePromise } from '@Lib/cancellablePromise';
import { runIterator } from '@Lib/runner';
import { Events } from './entity/events';

export function go<
    GenFn extends (...args1: readonly any[]) => Generator,
    Args extends Parameters<GenFn>,
    TReturn = unknown,
>(
    generator: GenFn,
    ...args: Args
): {
    cancellablePromise: CancellablePromise<TReturn | Events.CANCELLED>;
    channel: Channel<TReturn | Events.CANCELLED>;
} {
    const channel = makeChannel<TReturn | Events.CANCELLED>();
    const cancellablePromise = runIterator(generator(...args));

    return {
        cancellablePromise: cancellablePromise
            .then((res) => {
                makePutRequest(channel, res);
                return res;
            })
            .catch((e) => {
                close(channel);
                throw e;
            }),
        channel: closeOnAllValuesTaken(channel),
    };
}
