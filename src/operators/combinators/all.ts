import {
    createCancellablePromise,
} from '@Lib/cancellablePromise/createCancellablePromise';
import { cancelAll } from '@Lib/cancellablePromise/cancelAll';
import type { CancellablePromise } from '@Lib/cancellablePromise/entity/cancellablePromise';
import { CallInstruction } from '@Lib/go';
import { createRunnersFromCallInstructions } from '@Lib/shared/utils/createRunnersFromCallInstructions';

export function* all(...instructions: CallInstruction[]) {
    const runnerPromises: CancellablePromise<any>[] =
        yield createRunnersFromCallInstructions(...instructions);
    const { cancellablePromise, resolve, reject } = createCancellablePromise(
        async () => {
            await cancelAll(runnerPromises);
        },
    );

    const workerPromise = async () => {
        try {
            const results = await Promise.race([
                Promise.all(runnerPromises),
                cancellablePromise,
            ]).catch((e) => {
                throw e;
            });
            resolve(results);
        } catch (e) {
            await cancelAll(runnerPromises);
            reject(e);
        }
    };

    workerPromise();
    return cancellablePromise;
}
