import { Events } from '../entity';
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
        let currentIteratorValue;

        currentIteratorValue = await nextIteratorResult.value;

        let nextIteratorValue = currentIteratorValue;

        if (currentIteratorValue === Events.CANCELLED) {
            return currentIteratorValue;
        }

        yield currentIteratorValue;

        /* if task = assign a function return to currentIteratorValue */
        /* if scheduled task = yield it to generator */

        try {
            if (isGenerator(currentIteratorValue)) {
                let innerIterator;
                try {
                    innerIterator = asyncGeneratorProxy(currentIteratorValue);
                    nextIteratorResult = await innerIterator.next();
                    while (!nextIteratorResult.done) {
                        currentIteratorValue = await nextIteratorResult.value;
                        yield currentIteratorValue;

                        nextIteratorResult = await innerIterator.next(
                            currentIteratorValue,
                        );
                    }

                    nextIteratorValue = await nextIteratorResult.value;
                    yield nextIteratorValue;
                } catch (e) {
                    const errorIteratorResult = await innerIterator?.throw(e);
                    nextIteratorValue = await errorIteratorResult?.value;
                }
            }
            nextIteratorResult = iterator.next(nextIteratorValue);
        } catch (e) {
            nextIteratorResult = iterator.throw(e);
        }
    }
    return nextIteratorResult.value;
}
