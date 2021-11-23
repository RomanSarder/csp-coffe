import { CancellablePromise } from '@Lib/cancellablePromise';
import { InstructionType } from '@Lib/go';
import { HandlerReturn } from '../entity';
import { handleCancellablePromise } from './handleCancellablePromise';

export async function handleGenerator({
    subRunner,
    currentRunners,
    cancel,
    type,
    forkedRunners,
}: {
    subRunner: CancellablePromise<any>;
    type?: InstructionType.FORK | InstructionType.SPAWN;
    cancel: (reason?: any) => Promise<void>;
    currentRunners: CancellablePromise<any>[];
    forkedRunners: CancellablePromise<any>[];
}): Promise<HandlerReturn> {
    if (type === InstructionType.FORK) {
        forkedRunners.push(subRunner.catch((e) => cancel(e)));
        return ['next', subRunner];
    }

    if (type === InstructionType.SPAWN) {
        return ['next', subRunner.catch(console.error)];
    }

    return handleCancellablePromise({
        currentRunners,
        promise: subRunner,
    });
}
