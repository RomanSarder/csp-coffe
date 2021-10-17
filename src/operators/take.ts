import { events } from '../channel/constants';
import { Channel } from '../channel/channel.types';
import { isChannelClosedError } from '../channel/utils';
import {
    makeTake,
    releasePut,
    releaseTake,
    resetChannel,
    waitForIncomingPut,
    waitForTakeQueueToRelease,
} from './internal';

export async function take<T = unknown>(ch: Channel<T>) {
    try {
        await waitForTakeQueueToRelease(ch);
        makeTake(ch);

        try {
            await waitForIncomingPut(ch);
        } catch (e) {
            // If channel closed, cleanup made take
            if (isChannelClosedError(e)) {
                resetChannel(ch);
            }

            throw e;
        }
        releaseTake(ch);
        return releasePut(ch);
    } catch (e) {
        if (isChannelClosedError(e)) {
            return events.CHANNEL_CLOSED;
        }
        throw e;
    }
}
