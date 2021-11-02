import { Channel, FlattenChannel } from '@Lib/channel';
import { call } from '@Lib/go';
import { makePut } from './internal';

export function offerFn<C extends Channel<any>>(
    ch: C,
    data: FlattenChannel<C>,
): true | null {
    if (data === null) {
        throw new Error('null values are not allowed');
    }

    if (ch.putBuffer.isBlocked() || ch.isClosed) {
        return null;
    }
    makePut(ch, data);
    return true;
}

export function offer<C extends Channel<any>>(ch: C, data: FlattenChannel<C>) {
    return call(offerFn, ch, data);
}
