import {
    CancellablePromise,
    createCancellablePromise,
    isCancellablePromise,
} from '@Lib/cancellablePromise';
import { CallInstruction } from '@Lib/go';
import { createRunner } from '@Lib/runner';
import { isGenerator } from '@Lib/shared';

export function all(
    ...instructions: CallInstruction[]
): CancellablePromise<any> {
    const runnerPromises = instructions.map((instruction) => {
        const instructionResult = instruction.function(...instruction.args);

        if (isGenerator(instructionResult)) {
            return createRunner(instructionResult).catch((e) => {
                throw e;
            });
        }

        return Promise.resolve(instructionResult);
    });

    const cancelAll = async () => {
        const cancellationPromises = runnerPromises.map((promise) => {
            if (isCancellablePromise(promise)) {
                return promise.cancel();
            }
            return Promise.resolve();
        });

        return Promise.all(cancellationPromises);
    };

    const { cancellablePromise, resolve, reject } =
        createCancellablePromise(cancelAll);

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
            reject(e);
        }
    };

    workerPromise();

    return cancellablePromise;
}
