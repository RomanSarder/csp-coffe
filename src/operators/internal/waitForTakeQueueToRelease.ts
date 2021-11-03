import { Channel } from '@Lib/channel';
import { errorMessages } from '@Lib/channel/constants';

export function* waitForTakeQueueToRelease<C extends Channel<any>>(ch: C) {
    while (ch.takeBuffer.isBlocked()) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        yield;
    }
}
