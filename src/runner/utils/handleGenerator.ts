import { InstructionType } from '@Lib/go';
import { runIterator } from '../runIterator';
import { StepResult } from '../entity';
import { ChildrenIteratorsRunner } from '../entity/childrenIteratorsRunner';
import { handleCancellablePromise } from './handleCancellablePromise';

export async function handleGenerator({
    generator,
    childrenIteratorsRunner,
    type,
}: {
    generator: Generator;
    type?: InstructionType.FORK | InstructionType.SPAWN;
    childrenIteratorsRunner: ChildrenIteratorsRunner;
}): Promise<StepResult> {
    const runIteratorPromise = runIterator(generator);
    if (type === InstructionType.FORK) {
        return {
            value: childrenIteratorsRunner.fork(runIteratorPromise),
            done: false,
        };
    }

    if (type === InstructionType.SPAWN) {
        return {
            value: childrenIteratorsRunner.spawn(runIteratorPromise),
            done: false,
        };
    }

    return handleCancellablePromise({
        childrenIteratorsRunner,
        promise: runIteratorPromise,
    });
}
