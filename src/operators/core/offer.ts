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
    if (data === null) {
        throw new Error('null values are not allowed');
    }

    if (isPutBlocked(ch) || isChannelClosed(ch)) {
        return null;
    }
    makePutRequest(ch);
    yield;
    releasePut(ch);
    push(ch, data);
    return true;
}
