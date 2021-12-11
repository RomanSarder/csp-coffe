import {
    FlattenChannel,
    Channel,
    push,
    isChannelClosedError,
    resetChannel,
    makePutRequest,
    waitForIncomingTake,
    waitForPutQueueToRelease,
} from '@Lib/channel';

export function* put<C extends Channel<NonNullable<any>>>(
    ch: C,
    data: FlattenChannel<C>,
) {
    if (data === null) {
        throw new Error('null values are not allowed');
    }

    try {
        yield waitForPutQueueToRelease(ch);
        makePutRequest(ch);
        push(ch, data);

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
