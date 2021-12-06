import { close } from '@Lib/operators/close';
import { waitForIncomingPutAsync } from '@Lib/operators/internal/waitForIncomingPutAsync';
import { waitUntilBufferIsEmptyAsync } from '@Lib/operators/internal/waitUntilBufferEmptyAsync';
import { Channel } from '../channel.types';
import { isChannelClosedError } from '../utils/isChannelClosedError';
import { hasKey } from './utils/hasKey';

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
