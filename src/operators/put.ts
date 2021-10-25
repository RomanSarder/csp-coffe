import { makeExecuteInstruction } from '@Lib/go';
import { Channel } from '../channel/channel.types';
import { isChannelClosedError } from '../channel/utils';
import {
    makePut,
    resetChannel,
    waitForIncomingTake,
    waitForPutQueueToRelease,
} from './internal';
import { WAIT_FOR_INCOMING_TAKE } from './internal/waitForIncomingTake';
import { WAIT_FOR_PUT_QUEUE_TO_RELEASE } from './internal/waitForPutQueueToRelease';

export function* put<T = unknown>(ch: Channel<T>, data: T) {
    if (data === null) {
        throw new Error('null values are not allowed');
    }

    try {
        yield makeExecuteInstruction(
            WAIT_FOR_PUT_QUEUE_TO_RELEASE,
            waitForPutQueueToRelease(ch),
        );
        makePut(ch, data);

        if (!ch.isBuffered) {
            yield makeExecuteInstruction(
                WAIT_FOR_INCOMING_TAKE,
                waitForIncomingTake(ch),
            );
        }
    } catch (e) {
        if (!isChannelClosedError(e)) {
            throw e;
        }
        resetChannel(ch);
    }

    return true;
}
