import { CancellablePromise } from '@Lib/cancellablePromise';
import { StepResult } from '../entity';
import { ChildrenIteratorsRunner } from '../entity/childrenIteratorsRunner';

export async function handleCancellablePromise({
    promise,
    childrenIteratorsRunner,
}: {
    promise: CancellablePromise<any>;
    childrenIteratorsRunner: ChildrenIteratorsRunner;
}): Promise<StepResult> {
    let value;

    try {
        value = await childrenIteratorsRunner.run(promise);
        return { value, done: false };
    } catch (e) {
        return { value: undefined, error: e, done: false };
    }
}
