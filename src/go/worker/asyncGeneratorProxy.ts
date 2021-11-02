import { Events } from '../entity';
import { isGenerator } from './shared';
import { isTask } from '../instructions/task';

// eslint-disable-next-line consistent-return
export async function* asyncGeneratorProxy<G extends Generator>(
    iterator: G,
): AsyncGenerator {
    // const forkedIterators = [];
    // const forkedPromises = [];

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

        if (isTask(nextIteratorValue)) {
            nextIteratorValue = await nextIteratorValue.function(
                ...nextIteratorValue.args,
            );
        }

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

                    nextIteratorValue = await nextIteratorResult.value;
                    nextIteratorResult = {
                        value: nextIteratorValue,
                        done: false,
                    };
                    yield nextIteratorValue;
                } catch (e) {
                    const errorIteratorResult = await innerIterator?.throw(e);
                    nextIteratorResult = {
                        value: errorIteratorResult?.value,
                        done: false,
                    };
                }
            }
            nextIteratorResult = iterator.next(nextIteratorValue);
        } catch (e) {
            nextIteratorResult = iterator.throw(e);
        }
    }
    return nextIteratorResult.value;
}
