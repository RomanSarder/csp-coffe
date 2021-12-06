import { Channel } from '@Lib/channel/entity/channel';
import { errorMessages } from '@Lib/channel/entity/errorMessages';

export function* waitForTakeQueueToRelease<C extends Channel<any>>(ch: C) {
    while (ch.takeBuffer.isBlocked()) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        yield;
    }
}
