import { CancellablePromise } from '@Lib/cancellablePromise';
import { InstructionType } from '@Lib/go';
import { HandlerReturn } from '../entity';
import { ChildrenIteratorsRunner } from '../entity/childrenIteratorsRunner';
import { handleCancellablePromise } from './handleCancellablePromise';

export async function handleGenerator({
    subRunner,
    childrenIteratorsRunner,
    type,
}: {
    subRunner: CancellablePromise<any>;
    type?: InstructionType.FORK | InstructionType.SPAWN;
    childrenIteratorsRunner: ChildrenIteratorsRunner;
}): Promise<HandlerReturn> {
    if (type === InstructionType.FORK) {
        return ['next', childrenIteratorsRunner.fork(subRunner)];
    }

    if (type === InstructionType.SPAWN) {
        return ['next', childrenIteratorsRunner.spawn(subRunner)];
    }

    return handleCancellablePromise({
        childrenIteratorsRunner,
        promise: subRunner,
    });
}
