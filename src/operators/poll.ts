import { Channel, FlattenChannel } from '@Lib/channel';
import { call } from '@Lib/go';
import { releasePut } from './internal';

export function pollFn<C extends Channel<any>>(
    ch: C,
): FlattenChannel<C> | null {
    if (!ch.isClosed && ch.putBuffer.getSize() > 0) {
        return releasePut(ch) ?? null;
    }
    return null;
}

export function poll<C extends Channel<any>>(ch: C) {
    return call(pollFn, ch);
}
