import type { FlattenChannel, Channel } from '@Lib/channel';

import { call } from '../core/call';
import { releasePut } from '../internal/releasePut';

export function pollFn<C extends Channel<any>>(
    ch: C,
): FlattenChannel<C> | null {
    if (!ch.isClosed && ch.putBuffer.getSize() > 0) {
        const maybeResult = releasePut(ch);
        return maybeResult || null;
    }
    return null;
}

export function poll<C extends Channel<any>>(ch: C) {
    return call(pollFn, ch);
}
