import { FlattenChannel } from '@Lib/channel/entity/flatten';
import { Channel } from '@Lib/channel/entity/channel';
import { Events } from '@Lib/channel/entity/events';
import { errorMessages } from '@Lib/channel/entity/errorMessages';
import { isChannelClosedError } from '@Lib/channel/utils/isChannelClosedError';
import { makeTake } from './internal/makeTake';
import { releasePut } from './internal/releasePut';
import { releaseTake } from './internal/releaseTake';
import { waitForIncomingPut } from './internal/waitForIncomingPut';
import { waitForTakeQueueToRelease } from './internal/waitForTakeQueueToRelease';
import { resetChannel } from './internal/resetChannel';
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
            if (ch.isClosed) {
                throw new Error(errorMessages.CHANNEL_CLOSED);
            }
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
