import { isCancelError } from '@Lib/cancellablePromise/utils/isCancelError';
import {
    FlattenChannel,
    Channel,
    isPutBlocked,
    isChannelClosed,
    makePutRequest,
    releasePut,
    push,
} from '@Lib/channel';

export function* offer<C extends Channel<any>>(ch: C, data: FlattenChannel<C>) {
    let didPutRequest = false;
    try {
        if (data === null) {
            throw new Error('null values are not allowed');
        }

        if (isPutBlocked(ch) || isChannelClosed(ch)) {
            return null;
        }
        makePutRequest(ch);
        didPutRequest = true;
        yield;
        releasePut(ch);
        didPutRequest = false;
        push(ch, data);
        return true;
    } catch (e) {
        if (isCancelError(e)) {
            if (didPutRequest) {
                releasePut(ch);
            }
        }
        return false;
    }
}
