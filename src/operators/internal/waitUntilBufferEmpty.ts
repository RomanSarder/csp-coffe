import { Channel } from '@Lib/channel';
import { errorMessages } from '@Lib/channel/constants';

export function* waitUntilBufferEmpty<C extends Channel<any>>(ch: C) {
    if (ch.isClosed) {
        throw new Error(errorMessages.CHANNEL_CLOSED);
    }
    while (ch.putBuffer.getSize() > 0) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        yield;
    }
}
