import { Channel, FlattenChannel } from '@Lib/channel';
import { errorMessages, Events } from '../channel/constants';
import { isChannelClosedError } from '../channel/utils';
import {
    makeTake,
    releasePut,
    releaseTake,
    resetChannel,
    waitForIncomingPut,
    waitForTakeQueueToRelease,
} from './internal';
import { poll } from './poll';

export const TAKE = 'TAKE';

export function* take<C extends Channel<NonNullable<any>>>(ch: C) {
    try {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        yield waitForTakeQueueToRelease(ch);
        makeTake(ch);

        try {
            const maybeResult: FlattenChannel<C> | null = yield poll(ch);
            if (maybeResult !== null) {
                releaseTake(ch);
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
        return releasePut(ch);
    } catch (e) {
        if (isChannelClosedError(e)) {
            return Events.CHANNEL_CLOSED;
        }
        throw e;
    }
}
