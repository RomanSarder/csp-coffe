import { CancellablePromise } from '@Lib/cancellablePromise';
import { StepResult } from '../entity';
import { ChildrenIteratorsRunner } from '../entity/childrenIteratorsRunner';

export async function handleCancellablePromise({
    promise,
    childrenIteratorsRunner,
    done,
}: {
    promise: CancellablePromise<any>;
    childrenIteratorsRunner: ChildrenIteratorsRunner;
    done: boolean;
}): Promise<StepResult> {
    let value;

    try {
        value = await childrenIteratorsRunner.run(promise);
        return { value, done };
    } catch (e) {
        return { value: undefined, error: e, done };
    }
}
