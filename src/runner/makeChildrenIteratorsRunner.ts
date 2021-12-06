import { cancelAll } from '@Lib/cancellablePromise/cancelAll';
import type { CancellablePromise } from '@Lib/cancellablePromise/entity/cancellablePromise';
import { ChildrenIteratorsRunner } from './entity/childrenIteratorsRunner';

export function makeChildrenIteratorsRunner(): ChildrenIteratorsRunner {
    let cancelHandler: (reason: any) => Promise<void>;

    const forkedIteratorsPromises: (CancellablePromise<any> | Promise<any>)[] =
        [];
    const ongointIteratorsPromises: (CancellablePromise<any> | Promise<any>)[] =
        [];

    return {
        setCancelHandler(handler: (reason: any) => Promise<void>) {
            cancelHandler = handler;
        },

        fork(runIteratorPromise: CancellablePromise<any>) {
            forkedIteratorsPromises.push(
                runIteratorPromise.catch((e) => {
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

        async waitForForks() {
            await Promise.all(forkedIteratorsPromises);
        },

        cancelForks() {
            return cancelAll(forkedIteratorsPromises);
        },

        cancelOngoing() {
            return cancelAll(ongointIteratorsPromises);
        },
    };
}
