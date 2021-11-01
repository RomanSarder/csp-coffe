import { ExecuteInstruction, CallInstruction } from '../instructions';
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
                    nextIteratorValue = innerIterator.next(
                        nextIteratorValue.value,
                    );

                    while (!nextIteratorValue.done) {
                        yield nextIteratorValue.value;

                        nextIteratorValue = innerIterator.next();
                    }
                } catch (e) {
                    innerIterator?.throw(e);
                }
            } else if (isInstruction(nextIteratorValue.value)) {
                switch (nextIteratorValue.value.command) {
                    case Command.EXECUTE: {
                        const assertedValue =
                            nextIteratorValue.value as ExecuteInstruction;
                        let innerIterator;
                        try {
                            innerIterator = syncWorker(assertedValue.generator);
                            nextIteratorValue = innerIterator.next();

                            while (!nextIteratorValue.done) {
                                yield nextIteratorValue.value;

                                nextIteratorValue = innerIterator.next();
                            }
                        } catch (e) {
                            nextIteratorValue = innerIterator?.throw(e);
                        }
                        break;
                    }
                    case Command.CALL: {
                        const assertedValue =
                            nextIteratorValue.value as CallInstruction;

                        nextIteratorValue = assertedValue.function(
                            ...assertedValue.args,
                        );
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }

            nextIteratorValue = iterator.next(nextIteratorValue?.value);
        } catch (e) {
            nextIteratorValue = iterator.throw(e);
        }
    }

    return nextIteratorValue.value;
}
