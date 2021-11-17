import { cancelAll, createCancellablePromise } from '@Lib/cancellablePromise';
import { CallInstruction } from '@Lib/go';
import { createRunnersFromCallInstructions } from '@Lib/shared';

export function race(...instructions: CallInstruction[]) {
    const runnerPromises = createRunnersFromCallInstructions(...instructions);
    const { cancellablePromise, resolve, reject } = createCancellablePromise(
        async () => {
            await cancelAll(runnerPromises);
        },
    );

    const workerPromise = async () => {
        try {
            const results = await Promise.race([
                Promise.race(runnerPromises),
                cancellablePromise,
            ]).catch((e) => {
                throw e;
            });
            await cancelAll(runnerPromises);
            resolve(results);
        } catch (e) {
            await cancelAll(runnerPromises);
            reject(e);
        }
    };

    workerPromise();

    return cancellablePromise;
}
