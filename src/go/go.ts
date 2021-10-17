import { Channel, makeChannel } from '@Lib/channel';
import { closeOnAllValuesTaken } from '@Lib/channel/proxy';
import { makePut } from '@Lib/operators/internal';
import { ForkCommand, Commands } from './commands';
import { isCommand } from './commands/utils/isCommand';

type GeneratorReturn<G> = G extends Generator<unknown, infer R, unknown>
    ? R
    : unknown;

export function go<G extends Generator<unknown, unknown, unknown>>(
    generator: () => G,
): {
    promise: Promise<GeneratorReturn<G>>;
    channel: Channel<GeneratorReturn<G>>;
} {
    const forkedProcesses: Promise<any>[] = [];
    const ch = makeChannel<GeneratorReturn<G>>();
    const iterator = generator();

    function nextStep(resolvedValue: unknown): any {
        const { value: nextIteratorValue, done } = iterator.next(resolvedValue);

        if (done) {
            makePut(ch, nextIteratorValue as GeneratorReturn<G>);
            return Promise.all(forkedProcesses).then(() => nextIteratorValue);
        }

        if (isCommand(nextIteratorValue)) {
            if (nextIteratorValue[0] === Commands.FORK) {
                const { promise } = (nextIteratorValue as ForkCommand)[1];
                forkedProcesses.push(promise);
            }
        }

        if (nextIteratorValue instanceof Promise) {
            return nextIteratorValue.then(nextStep);
        }

        return Promise.resolve(nextIteratorValue).then(nextStep);
    }

    return {
        promise: Promise.resolve().then(nextStep),
        channel: closeOnAllValuesTaken(ch),
    };
}
