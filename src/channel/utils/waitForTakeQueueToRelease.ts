import type { Channel } from '../entity/channel';
import { errorMessages } from '../entity/errorMessages';

import { TakeBuffer } from '../entity/privateKeys';

export function* waitForTakeQueueToRelease<C extends Channel<any>>(ch: C) {
    while (ch[TakeBuffer].isBlocked()) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        yield;
    }
}
