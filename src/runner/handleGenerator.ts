import { CancellablePromise } from '@Lib/cancellablePromise';
import { createRunner } from '.';
import { StepperVerb } from './entity';
import { handleCancellablePromise } from './handleCancellablePromise';

export async function handleGenerator({
    stepFn,
    generator,
    currentRunners,
    isFork,
    forkedRunners,
}: {
    stepFn: (verb: StepperVerb, arg?: any) => Promise<any>;
    generator: Generator;
    isFork: boolean;
    currentRunners: CancellablePromise<any>[];
    forkedRunners: CancellablePromise<any>[];
}) {
    const subRunner = createRunner(generator);

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
