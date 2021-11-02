import { Channel, FlattenChannel } from '../channel/channel.types';
import { isChannelClosedError } from '../channel/utils';
import {
    makePut,
    resetChannel,
    waitForIncomingTake,
    waitForPutQueueToRelease,
} from './internal';

export const PUT = 'PUT';

export function* put<C extends Channel<NonNullable<any>>>(
    ch: C,
    data: FlattenChannel<C>,
) {
    if (data === null) {
        throw new Error('null values are not allowed');
    }

    try {
        yield waitForPutQueueToRelease(ch);
        makePut(ch, data);

        if (!ch.isBuffered) {
            yield waitForIncomingTake(ch);
        }
    } catch (e) {
        if (!isChannelClosedError(e)) {
            throw e;
        }
        resetChannel(ch);
        return false;
    }

    return true;
}
