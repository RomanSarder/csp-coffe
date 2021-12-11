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
    if (!isChannelClosed(ch) && hasValues(ch)) {
        makeTakeRequest(ch);
        yield;
        releaseTake(ch);
        releasePut(ch);
        return pop(ch) || null;
    }
    return null;
}
