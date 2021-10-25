import { close } from '@Lib/operators';
import {
    waitForIncomingPutAsync,
    waitForPutQueueToReleaseAsync,
} from '@Lib/operators/internal';
import { Channel } from '../channel.types';
import { isChannelClosedError } from '../utils';
import { hasKey } from './utils';

let waitingPromise: Promise<void>;

export function closeOnAllValuesTaken<C extends Channel<any>>(ch: C) {
    return new Proxy(ch, {
        get(target, name, receiver) {
            if (!waitingPromise) {
                waitingPromise = new Promise((resolve) => {
                    waitForIncomingPutAsync(target)
                        .then(() => {
                            return waitForPutQueueToReleaseAsync(target);
                        })
                        .then(() => {
                            close(target);
                            resolve();
                        })
                        .catch((e) => {
                            if (isChannelClosedError(e)) {
                                close(target);
                                resolve();
                            }
                            throw e;
                        });
                });
            }
            return hasKey(ch, name)
                ? Reflect.get(target, name, receiver)
                : undefined;
        },
    });
}
