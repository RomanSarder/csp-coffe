import { ExecuteInstruction, CallInstruction } from '../instructions';
import { Command, Events } from '../entity';
import { isInstruction } from '../utils';
import { isGenerator } from './shared';

// eslint-disable-next-line consistent-return
export async function* asyncGeneratorProxy<G extends Generator>(
    iterator: G,
): AsyncGenerator {
    let nextIteratorResult;
    try {
        nextIteratorResult = iterator.next();
    } catch (e) {
        return iterator.throw(e);
    }
    while (!nextIteratorResult.done) {
        let nextIteratorValue = await nextIteratorResult.value;

        if (nextIteratorValue === Events.CANCELLED) {
            return nextIteratorValue;
        }

        yield nextIteratorValue;
        try {
            if (isGenerator(nextIteratorValue)) {
                let innerIterator;
                try {
                    innerIterator = asyncGeneratorProxy(nextIteratorValue);
                    nextIteratorResult = await innerIterator.next();
                    while (!nextIteratorResult.done) {
                        nextIteratorValue = await nextIteratorResult.value;
                        yield nextIteratorValue;

                        nextIteratorResult = await innerIterator.next(
                            nextIteratorValue,
                        );
                    }
                } catch (e) {
                    await innerIterator?.throw(e);
                }
            } else if (isInstruction(nextIteratorValue)) {
                switch (nextIteratorValue.command) {
                    case Command.EXECUTE: {
                        const assertedValue =
                            nextIteratorValue as ExecuteInstruction;
                        let innerIterator;
                        try {
                            innerIterator = asyncGeneratorProxy(
                                assertedValue.generator,
                            );
                            nextIteratorResult = await innerIterator.next();

                            while (!nextIteratorResult.done) {
                                yield nextIteratorValue;

                                nextIteratorResult = await innerIterator.next(
                                    nextIteratorValue,
                                );
                            }
                        } catch (e) {
                            nextIteratorResult = await innerIterator?.throw(e);
                        }
                        break;
                    }
                    case Command.CALL: {
                        const assertedValue =
                            nextIteratorValue as CallInstruction;

                        nextIteratorResult = assertedValue.function(
                            ...assertedValue.args,
                        );
                        break;
                    }
                    default: {
                        break;
                    }
                }
            }

            nextIteratorResult = iterator.next(nextIteratorValue);
        } catch (e) {
            nextIteratorResult = iterator.throw(e);
        }
    }

    return nextIteratorResult.value;
}
