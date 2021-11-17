import {
    cancelAll,
    CancellablePromise,
    createCancellablePromise,
} from '@Lib/cancellablePromise';
import { CallInstruction } from '@Lib/go';
import { createRunnersFromCallInstructions } from '@Lib/shared';

export function all(
    ...instructions: CallInstruction[]
): CancellablePromise<any> {
    const runnerPromises = createRunnersFromCallInstructions(...instructions);

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
