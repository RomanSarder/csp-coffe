import { InstructionType } from '@Lib/go';
import { CancellablePromise } from '@Lib/cancellablePromise';
import { StepResult } from '../entity';
import { ChildrenIteratorsRunner } from '../entity/childrenIteratorsRunner';
import { handleCancellablePromise } from './handleCancellablePromise';

export async function handleGenerator({
    runIteratorPromise,
    childrenIteratorsRunner,
    type,
}: {
    runIteratorPromise: CancellablePromise<any>;
    type?: InstructionType.FORK | InstructionType.SPAWN;
    childrenIteratorsRunner: ChildrenIteratorsRunner;
}): Promise<StepResult> {
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
