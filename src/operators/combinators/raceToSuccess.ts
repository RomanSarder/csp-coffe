import { createCancellablePromise, cancelAll } from '@Lib/cancellablePromise';
import type { CancellablePromise } from '@Lib/cancellablePromise';
import { CallInstruction } from '@Lib/go/entity/callInstruction';
import { createRunnersFromCallInstructions } from '@Lib/shared/utils/createRunnersFromCallInstructions';
import { raceToSuccess as promiseRaceToSuccess } from '@Lib/operators/utils/raceToSuccess';

export function* raceToSuccess(...instructions: CallInstruction[]) {
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
                promiseRaceToSuccess(runnerPromises),
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
