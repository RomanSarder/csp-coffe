import type { Channel } from '../entity/channel';
import { errorMessages } from '../entity/errorMessages';
import { TakeBuffer } from '../entity/privateKeys';

export function* waitForIncomingTake<C extends Channel<any>>(ch: C) {
    if (ch.isClosed) {
        throw new Error(errorMessages.CHANNEL_CLOSED);
    }

    while (ch[TakeBuffer].getSize() === 0) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        yield;
    }
}
