import { Channel } from '@Lib/channel/entity/channel';
import { errorMessages } from '@Lib/channel/entity/errorMessages';

export function* waitForPutQueueToRelease<C extends Channel<any>>(ch: C) {
    if (ch.isClosed) {
        throw new Error(errorMessages.CHANNEL_CLOSED);
    }
    while (ch.putBuffer.isBlocked()) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        yield;
    }
}
