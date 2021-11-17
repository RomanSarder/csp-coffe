import { CancellablePromise } from '@Lib/cancellablePromise';
import { HandlerReturn, StepperVerb } from '../entity';

export async function handleCancellablePromise({
    promise,
    currentRunners,
}: {
    promise: CancellablePromise<any>;
    currentRunners: CancellablePromise<any>[];
}): Promise<HandlerReturn> {
    currentRunners.push(promise);
    let nextVerb: StepperVerb;
    let nextValue;
    try {
        const runnerResult = await promise;
        nextVerb = 'next';
        nextValue = runnerResult;
    } catch (e) {
        nextVerb = 'throw';
        nextValue = e;
    }
    currentRunners.pop();
    return [nextVerb, nextValue];
}
