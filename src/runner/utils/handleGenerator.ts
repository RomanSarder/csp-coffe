import { CancellablePromise } from '@Lib/cancellablePromise';
import { HandlerReturn } from '../entity';
import { handleCancellablePromise } from './handleCancellablePromise';

export async function handleGenerator({
    subRunner,
    currentRunners,
    cancel,
    isFork,
    forkedRunners,
}: {
    subRunner: CancellablePromise<any>;
    isFork: boolean;
    cancel: (reason?: any) => Promise<void>;
    currentRunners: CancellablePromise<any>[];
    forkedRunners: CancellablePromise<any>[];
}): Promise<HandlerReturn> {
    if (isFork) {
        forkedRunners.push(subRunner.catch((e) => cancel(e)));
        return ['next', subRunner];
    }

    return handleCancellablePromise({
        currentRunners,
        promise: subRunner,
    });
}
