import { Channel } from '../channel/channel.types';
import { isChannelClosedError } from '../channel/utils';
import {
    makePut,
    resetChannel,
    waitForIncomingTake,
    waitForPutQueueToRelease,
} from './internal';

export async function put<T = unknown>(
    ch: Channel<T>,
    data: T,
): Promise<boolean> {
    if (data === null) {
        throw new Error('null values are not allowed');
    }

    try {
        await waitForPutQueueToRelease(ch);
        makePut(ch, data);

        if (!ch.isBuffered) {
            try {
                await waitForIncomingTake(ch);
            } catch (e) {
                if (isChannelClosedError(e)) {
                    resetChannel(ch);
                }

                throw e;
            }
        }
    } catch (e) {
        if (!isChannelClosedError(e)) {
            throw e;
        }
    }

    return true;
}
