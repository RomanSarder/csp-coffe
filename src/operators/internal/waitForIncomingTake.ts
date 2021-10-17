import { Channel } from '@Lib/channel';
import { errorMessages } from '@Lib/channel/constants';
import { eventLoopQueue } from '@Lib/internal';

export async function waitForIncomingTake<T = unknown>(ch: Channel<T>) {
    if (ch.isClosed) {
        throw new Error(errorMessages.CHANNEL_CLOSED);
    }

    while (ch.takeBuffer.getSize() === 0) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        await eventLoopQueue();
    }
}
