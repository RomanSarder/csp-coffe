import { Channel, makeChannel } from '@Lib/channel';
import { closeOnAllValuesTaken } from '@Lib/channel/proxy';
import { eventLoopQueue } from '@Lib/internal';
import { makePut } from '@Lib/operators/internal';
import { EVENTS } from '.';
import { ForkCommand, Commands } from './commands';
import { isCommand } from './commands/utils/isCommand';
import { CancelledRef } from './go.types';

type GeneratorReturn<G> = G extends Generator<unknown, infer R, unknown>
    ? R | 'CANCELLED'
    : unknown | 'CANCELLED';

export function go<G extends Generator<unknown, unknown, unknown>>(
    generator: () => G,
    isCancelledRef: CancelledRef = { ref: false },
): {
    promise: Promise<GeneratorReturn<G>>;
    channel: Channel<GeneratorReturn<G>>;
    cancel: () => void;
} {
    const forkedProcesses: Promise<any>[] = [];
    const ch = makeChannel<GeneratorReturn<G>>();
    const iterator = generator();

    function nextStep(resolvedValue: unknown): any {
        const { value: nextIteratorValue, done } = iterator.next(resolvedValue);
        if (isCancelledRef.ref) {
            makePut(ch, EVENTS.CANCELLED);
            return eventLoopQueue().then(() => {
                return EVENTS.CANCELLED;
            });
        }

        if (done) {
            makePut(ch, nextIteratorValue as GeneratorReturn<G>);
            return eventLoopQueue()
                .then(() => {
                    return Promise.all(forkedProcesses);
                })
                .then(() => nextIteratorValue);
        }

        if (isCommand(nextIteratorValue)) {
            if (nextIteratorValue[0] === Commands.FORK) {
                const { promise } = (nextIteratorValue as ForkCommand)[1](
                    isCancelledRef,
                );
                forkedProcesses.push(promise);
            }
        }

        if (nextIteratorValue instanceof Promise) {
            return eventLoopQueue()
                .then(() => {
                    return Promise.resolve(nextIteratorValue);
                })
                .then(nextStep);
        }

        return eventLoopQueue()
            .then(() => Promise.resolve(nextIteratorValue))
            .then(nextStep);
    }

    return {
        promise: Promise.resolve().then(nextStep),
        channel: closeOnAllValuesTaken(ch),
        cancel: () => {
            // eslint-disable-next-line no-param-reassign
            isCancelledRef.ref = true;
        },
    };
}
