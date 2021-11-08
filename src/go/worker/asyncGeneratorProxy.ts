import {
    CANCEL,
    createCancellableTask,
    isCancelError,
} from '@Lib/cancellableTask';
import { Events, InstructionType } from '../entity';
import { isGenerator } from './shared';
import { isInstruction } from '../utils';

// eslint-disable-next-line consistent-return
export async function* asyncGeneratorProxy<G extends Generator>(
    iterator: G,
): AsyncGenerator {
    const forkedProcesses: any[] = [];

    try {
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
            if (isInstruction(currentIteratorValue)) {
                const instruction = currentIteratorValue;
                const result = await currentIteratorValue.function(
                    ...currentIteratorValue.args,
                );

                if (isGenerator(result)) {
                    const isFork = instruction.type === InstructionType.FORK;
                    const task = createCancellableTask({
                        fn: instruction.function,
                        args: instruction.args,
                        isFork,
                    });

                    if (isFork) {
                        nextIteratorValue = task;
                        forkedProcesses.push(task);
                    } else {
                        nextIteratorValue = await task;
                    }
                    console.log('is fork', isFork, task);
                } else {
                    nextIteratorValue = result;
                }
            }

            /* if task = assign a function return to currentIteratorValue */
            /* if scheduled task = yield it to generator */

            try {
                if (isGenerator(currentIteratorValue)) {
                    let innerIterator;
                    try {
                        innerIterator =
                            asyncGeneratorProxy(currentIteratorValue);
                        nextIteratorResult = await innerIterator.next();
                        while (!nextIteratorResult.done) {
                            currentIteratorValue =
                                await nextIteratorResult.value;
                            yield currentIteratorValue;

                            nextIteratorResult = await innerIterator.next(
                                currentIteratorValue,
                            );
                        }

                        nextIteratorValue = await nextIteratorResult.value;
                        yield nextIteratorValue;
                    } catch (e) {
                        console.log('inner e', e);
                        const errorIteratorResult = await innerIterator?.throw(
                            e,
                        );
                        nextIteratorValue = await errorIteratorResult?.value;
                    }
                }
                nextIteratorResult = iterator.next(nextIteratorValue);
            } catch (e) {
                nextIteratorResult = iterator.throw(e);
            }
        }
        await Promise.all(forkedProcesses);
        return nextIteratorResult.value;
    } catch (e) {
        if (isCancelError(e)) {
            forkedProcesses.forEach(async (task) => {
                await task[CANCEL]();
            });
        }
    }
}
