import { makeExecuteInstruction } from '@Lib/go';
import { Channel } from '../channel/channel.types';
import { isChannelClosedError } from '../channel/utils';
import {
    makePut,
    resetChannel,
    waitForIncomingTake,
    waitForPutQueueToRelease,
} from './internal';

export function* put<T = unknown>(ch: Channel<T>, data: T) {
    if (data === null) {
        throw new Error('null values are not allowed');
    }

    try {
        yield makeExecuteInstruction(waitForPutQueueToRelease(ch));
        makePut(ch, data);

        if (!ch.isBuffered) {
            yield makeExecuteInstruction(waitForIncomingTake(ch));
        }
    } catch (e) {
        if (!isChannelClosedError(e)) {
            throw e;
        }
        resetChannel(ch);
    }

    return true;
}
