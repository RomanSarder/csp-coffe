import { cancelAll, createCancellablePromise } from '@Lib/cancellablePromise';
import type { CancellablePromise } from '@Lib/cancellablePromise';
import type { ChildrenIteratorsRunner } from './entity/childrenIteratorsRunner';
import { exitStepperMessage } from './entity/exitStepperMessage';

export function makeChildrenIteratorsRunner(): ChildrenIteratorsRunner {
    let cancelHandler: (reason: any) => Promise<void>;

    const forkedIteratorsPromises: (CancellablePromise<any> | Promise<any>)[] =
        [];
    const ongointIteratorsPromises: (CancellablePromise<any> | Promise<any>)[] =
        [];

    const { resolve, reject, cancellablePromise } = createCancellablePromise();

    return {
        setCancelHandler(handler: (reason: any) => Promise<void>) {
            cancelHandler = handler;
        },
        fork(runIteratorPromise: CancellablePromise<any>) {
            forkedIteratorsPromises.push(
                runIteratorPromise.catch((e) => {
                    resolve(exitStepperMessage);
                    return cancelHandler?.(e);
                }),
            );
            return runIteratorPromise;
        },
        async run(runIteratorPromise: CancellablePromise<any>) {
            try {
                ongointIteratorsPromises.push(runIteratorPromise);
                const result = await runIteratorPromise;
                return result;
            } finally {
                ongointIteratorsPromises.pop();
            }
        },
        spawn(runIteratorPromise: CancellablePromise<any>) {
            return runIteratorPromise.catch(console.error);
        },

        waitForForks() {
            Promise.all(forkedIteratorsPromises).then(resolve).catch(reject);
            return cancellablePromise;
        },

        cancelForks() {
            return cancelAll(forkedIteratorsPromises);
        },

        cancelOngoing() {
            return cancelAll(ongointIteratorsPromises);
        },
    };
}
