import { Events, Instruction, isInstruction } from '@Lib/go';
import { isGenerator } from '@Lib/shared/utils/isGenerator';

export async function* asyncGeneratorProxy<G extends Generator>(
    iterator: G,
    instructionsList: Instruction[],
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

        try {
            if (isInstruction(currentIteratorValue)) {
                instructionsList.push(currentIteratorValue);
            }

            if (isGenerator(currentIteratorValue)) {
                let innerIterator;
                try {
                    innerIterator = asyncGeneratorProxy(
                        currentIteratorValue,
                        instructionsList,
                    );
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
