import { Events, makeExecuteInstruction } from '@Lib/go';
import { FlattenChannel } from '@Lib/channel';
import { errorMessages, events } from '../channel/constants';
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
import { Operator } from './operator.types';

export const TAKE = 'TAKE';

export function* takeGenerator<C extends Channel<NonNullable<any>>>(ch: C) {
    try {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }

        yield makeExecuteInstruction(waitForTakeQueueToRelease, ch);
        makeTake(ch);

        try {
            yield makeExecuteInstruction(waitForIncomingPut, ch);
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

export function take<C extends Channel<any>>(
    ch: C,
): Operator<Generator<unknown, FlattenChannel<C> | Events.CANCELLED>> {
    return {
        name: TAKE,
        generator: takeGenerator(ch),
    };
}
