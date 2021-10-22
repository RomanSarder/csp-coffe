import { Channel } from '@Lib/channel';
import { errorMessages } from '@Lib/channel/constants';
import { makeParkCommand } from '@Lib/go/utils';

export function* waitForTakeQueueToRelease<C extends Channel<any>>(ch: C) {
    while ((yield ch.takeBuffer.isBlocked()) as boolean) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        yield makeParkCommand();
    }
    return 50;
}
