import { CancellablePromise } from '@Lib/cancellablePromise';
import { StepperVerb } from './entity';

export async function handleCancellablePromise({
    stepFn,
    promise,
    currentRunners,
}: {
    stepFn: (verb: StepperVerb, arg?: any) => Promise<any>;
    promise: CancellablePromise<any>;
    currentRunners: CancellablePromise<any>[];
}) {
    currentRunners.push(promise);
    let nextAction;
    try {
        const runnerResult = await promise;
        nextAction = stepFn('next', runnerResult);
    } catch (e) {
        nextAction = stepFn('throw', e);
    }
    currentRunners.pop();
    return nextAction;
}
