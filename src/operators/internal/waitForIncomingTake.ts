import { Channel } from '@Lib/channel/entity/channel';
import { errorMessages } from '@Lib/channel/entity/errorMessages';

export function* waitForIncomingTake<C extends Channel<any>>(ch: C) {
    if (ch.isClosed) {
        throw new Error(errorMessages.CHANNEL_CLOSED);
    }

    while (ch.takeBuffer.getSize() === 0) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        yield;
    }
}
