import { Channel } from '@Lib/channel/channel.types';
import { errorMessages } from '@Lib/channel/constants';
import { eventLoopQueue } from '@Lib/internal';

export async function waitForIncomingPut<T = unknown>(ch: Channel<T>) {
    if (ch.isClosed) {
        throw new Error(errorMessages.CHANNEL_CLOSED);
    }

    while (ch.putBuffer.getSize() === 0) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        await eventLoopQueue();
    }
}
