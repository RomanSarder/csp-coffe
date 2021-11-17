import { CancellablePromise } from '@Lib/cancellablePromise';
import { createRunner } from '../createRunner';
import { HandlerReturn } from '../entity';
import { handleCancellablePromise } from './handleCancellablePromise';

export async function handleGenerator({
    generator,
    currentRunners,
    isFork,
    cancel,
    forkedRunners,
}: {
    generator: Generator;
    isFork: boolean;
    cancel: (reason?: any) => Promise<void>;
    currentRunners: CancellablePromise<any>[];
    forkedRunners: CancellablePromise<any>[];
}): Promise<HandlerReturn> {
    const subRunner = createRunner(generator).catch((e) => cancel(e));

    if (isFork) {
        forkedRunners.push(subRunner);
        return ['next', subRunner];
    }

    return handleCancellablePromise({
        currentRunners,
        promise: subRunner,
    });
}
