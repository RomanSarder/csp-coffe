import { waitForIncomingPutAsync } from '../utils/waitForIncomingPutAsync';
import { waitUntilBufferIsEmptyAsync } from '../utils/waitUntilBufferEmptyAsync';
import { Channel } from '../entity/channel';
import { isChannelClosedError } from '../utils/isChannelClosedError';
import { hasKey } from './utils/hasKey';
import { close } from '../utils/close';

export function closeOnAllValuesTaken<C extends Channel<any>>(ch: C) {
    let waitingPromise: Promise<void>;

    return new Proxy(ch, {
        get(target, name, receiver) {
            if (!waitingPromise) {
                waitingPromise = new Promise((resolve) => {
                    waitForIncomingPutAsync(target)
                        .then(() => {
                            return waitUntilBufferIsEmptyAsync(target);
                        })
                        .then(() => {
                            close(target);
                            resolve();
                        })
                        .catch((e: any) => {
                            if (isChannelClosedError(e)) {
                                resolve();
                            } else {
                                throw e;
                            }
                        });
                });
            }
            return hasKey(ch, name)
                ? Reflect.get(target, name, receiver)
                : undefined;
        },
    });
}
