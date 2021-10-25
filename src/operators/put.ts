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
        console.log('waiting for put queue to release');
        yield makeExecuteInstruction(
            WAIT_FOR_PUT_QUEUE_TO_RELEASE,
            waitForPutQueueToRelease(ch),
        );
        console.log('make put');
        makePut(ch, data);

        if (!ch.isBuffered) {
            console.log('wait for take');
            yield makeExecuteInstruction(
                WAIT_FOR_INCOMING_TAKE,
                waitForIncomingTake(ch),
            );
        }
    } catch (e) {
        console.log('put error', e);
        if (!isChannelClosedError(e)) {
            console.log('is channel closed error');
            throw e;
        }
        resetChannel(ch);
    }

    return true;
}
