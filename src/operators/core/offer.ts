import type { FlattenChannel, Channel } from '@Lib/channel';

import { call } from '@Lib/go/instructions/call';
import { makePut } from '../internal/makePut';

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
