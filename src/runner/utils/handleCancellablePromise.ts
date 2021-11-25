import { CancellablePromise } from '@Lib/cancellablePromise';
import { HandlerReturn } from '../entity';
import { ChildrenIteratorsRunner } from '../entity/childrenIteratorsRunner';

export async function handleCancellablePromise({
    promise,
    childrenIteratorsRunner,
}: {
    promise: CancellablePromise<any>;
    childrenIteratorsRunner: ChildrenIteratorsRunner;
}): Promise<HandlerReturn> {
    return ['next', await childrenIteratorsRunner.run(promise)];
}
