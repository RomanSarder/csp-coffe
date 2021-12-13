import { isCancelError } from '@Lib/cancellablePromise/utils/isCancelError';
import {
    Channel,
    isChannelClosed,
    hasValues,
    releasePut,
    pop,
    makeTakeRequest,
    releaseTake,
} from '@Lib/channel';

export function* poll<C extends Channel<any>>(ch: C) {
    let didTakeRequest = false;
    try {
        if (!isChannelClosed(ch) && hasValues(ch)) {
            makeTakeRequest(ch);
            didTakeRequest = true;
            yield;
            releaseTake(ch);
            didTakeRequest = false;
            releasePut(ch);
            return pop(ch) || null;
        }
    } catch (e) {
        if (isCancelError(e)) {
            if (didTakeRequest) {
                releaseTake(ch);
            }
        }
    }
    return null;
}
