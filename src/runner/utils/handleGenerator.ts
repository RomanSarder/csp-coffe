import { CancellablePromise } from '@Lib/cancellablePromise';
import { createRunner } from '../createRunner';
import { StepperVerb } from '../entity';
import { handleCancellablePromise } from './handleCancellablePromise';

export async function handleGenerator({
    stepFn,
    generator,
    currentRunners,
    isFork,
    cancel,
    forkedRunners,
}: {
    stepFn: (verb: StepperVerb, arg?: any) => Promise<any>;
    generator: Generator;
    isFork: boolean;
    cancel: (reason?: any) => Promise<void>;
    currentRunners: CancellablePromise<any>[];
    forkedRunners: CancellablePromise<any>[];
}) {
    const subRunner = createRunner(generator).catch((e) => cancel(e));

    if (isFork) {
        forkedRunners.push(subRunner);
        return stepFn('next', subRunner);
    }

    return handleCancellablePromise({
        stepFn,
        currentRunners,
        promise: subRunner,
    });
}
