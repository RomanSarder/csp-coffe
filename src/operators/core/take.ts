import { FlattenChannel } from '@Lib/channel/entity/flatten';
import { Channel } from '@Lib/channel/entity/channel';
import { Events } from '@Lib/channel/entity/events';
import { errorMessages } from '@Lib/channel/entity/errorMessages';
import { isChannelClosedError } from '@Lib/channel/utils/isChannelClosedError';
import {
    makeTakeRequest,
    pop,
    releasePut,
    releaseTake,
    resetChannel,
    waitForIncomingPut,
    waitForTakeQueueToRelease,
} from '@Lib/channel';
import { poll } from './poll';
import { isCancelError } from '@Lib/cancellablePromise/utils/isCancelError';

export function* take<C extends Channel<NonNullable<any>>>(ch: C) {
    let didPutTakeRequest = false;
    let interval;
    try {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        yield waitForTakeQueueToRelease(ch);
        makeTakeRequest(ch);
        didPutTakeRequest = true;
        try {
            if (ch.isClosed) {
                throw new Error(errorMessages.CHANNEL_CLOSED);
            }

            const maybeResult: FlattenChannel<C> | null = yield poll(ch);
            if (maybeResult !== null) {
                return maybeResult;
            }
            yield waitForIncomingPut(ch);
        } catch (e) {
            // If channel closed, cleanup made take
            if (isChannelClosedError(e)) {
                resetChannel(ch);
            }

            throw e;
        }
        releaseTake(ch);
        didPutTakeRequest = false;
        releasePut(ch);
        return pop(ch);
    } catch (e) {
        if (interval) {
            clearInterval(interval);
        }
        if (isChannelClosedError(e)) {
            return Events.CHANNEL_CLOSED;
        }
        if (isCancelError(e)) {
            if (didPutTakeRequest) {
                releaseTake(ch);
            }
        }
        throw e;
    }
}
