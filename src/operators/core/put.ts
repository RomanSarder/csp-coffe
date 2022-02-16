import { isCancelError } from '@Lib/cancellablePromise/utils/isCancelError';
import {
    FlattenChannel,
    Channel,
    push,
    isChannelClosedError,
    resetChannel,
    makePutRequest,
    waitForIncomingTake,
    waitForPutQueueToRelease,
    releasePut,
} from '@Lib/channel';

export function* put<C extends Channel<NonNullable<any>>>(
    ch: C,
    data: FlattenChannel<C>,
) {
    let didPutRequest = false;
    if (data === null) {
        throw new Error('null values are not allowed');
    }

    try {
        yield waitForPutQueueToRelease(ch);
        push(ch, data);
        makePutRequest(ch);
        didPutRequest = true;

        if (!ch.isBuffered) {
            yield waitForIncomingTake(ch);
        }
    } catch (e) {
        if (isChannelClosedError(e)) {
            resetChannel(ch);
            return false;
        }
        if (isCancelError(e)) {
            if (didPutRequest) {
                releasePut(ch);
            }
        }
        throw e;
    }

    return true;
}
