import { Channel, makeChannel } from '@Lib/channel';
import { closeOnAllValuesTaken } from '@Lib/channel/proxy';
import { makePut } from '@Lib/operators/internal';

type GeneratorReturn<G> = G extends Generator<unknown, infer R, unknown>
    ? R
    : unknown;

export function go<G extends Generator<unknown, unknown, unknown>>(
    generator: () => G,
): {
    promise: Promise<GeneratorReturn<G>>;
    channel: Channel<GeneratorReturn<G>>;
} {
    const ch = makeChannel<GeneratorReturn<G>>();
    const iterator = generator();

    function nextStep(resolvedValue: unknown): any {
        const { value: nextIteratorValue, done } = iterator.next(resolvedValue);
        if (done) {
            makePut(ch, nextIteratorValue as GeneratorReturn<G>);
            return nextIteratorValue;
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
