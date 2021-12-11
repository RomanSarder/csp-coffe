import type { Channel } from '../entity/channel';
import { errorMessages } from '../entity/errorMessages';

import { PutBuffer } from '../entity/privateKeys';

export function* waitUntilBufferEmpty<C extends Channel<any>>(ch: C) {
    if (ch.isClosed) {
        throw new Error(errorMessages.CHANNEL_CLOSED);
    }
    while (ch[PutBuffer].getSize() > 0) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        yield;
    }
}
