import type { Channel } from '../entity/channel';
import { errorMessages } from '../entity/errorMessages';

import { isPutBlocked } from './isPutBlocked';

export function* waitForPutQueueToRelease<C extends Channel<any>>(ch: C) {
    if (ch.isClosed) {
        throw new Error(errorMessages.CHANNEL_CLOSED);
    }
    while (isPutBlocked(ch)) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        yield;
    }
}
