import { Command } from '../entity';
import { isInstruction } from '../utils';
import { isGenerator } from './shared';

// eslint-disable-next-line consistent-return
export function* syncWorker<G extends Generator>(iterator: G): Generator {
    let nextIteratorValue;
    try {
        nextIteratorValue = iterator.next();
    } catch (e) {
        return iterator.throw(e);
    }

    while (!nextIteratorValue.done) {
        yield nextIteratorValue.value;
        try {
            if (isGenerator(nextIteratorValue.value)) {
                let innerIterator;
                try {
                    innerIterator = syncWorker(nextIteratorValue.value);
                    let innerNextIteratorValue = innerIterator.next();

                    while (!innerNextIteratorValue.done) {
                        yield innerNextIteratorValue.value;

                        innerNextIteratorValue = innerIterator.next();
                    }
                } catch (e) {
                    innerIterator?.throw(e);
                }
            } else if (
                isInstruction(nextIteratorValue.value) &&
                nextIteratorValue.value.command === Command.EXECUTE
            ) {
                let innerIterator;
                try {
                    innerIterator = syncWorker(
                        nextIteratorValue.value.value as Generator,
                    );
                    nextIteratorValue = innerIterator.next();

                    while (!nextIteratorValue.done) {
                        yield nextIteratorValue.value;

                        nextIteratorValue = innerIterator.next();
                    }
                } catch (e) {
                    nextIteratorValue = innerIterator?.throw(e);
                }
            }
            nextIteratorValue = iterator.next();
        } catch (e) {
            nextIteratorValue = iterator.throw(e);
        }
    }

    return nextIteratorValue.value;
}
