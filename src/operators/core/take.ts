import type { FlattenChannel, Channel } from '@Lib/channel';

import { Events } from '@Lib/channel';
import { probe } from './probe';

export const TAKE = 'TAKE';

export function* take<C extends Channel<NonNullable<any>>>(ch: C) {
    const result: FlattenChannel<C> | null = yield probe(ch, () => true);
    if (result === null) {
        return Events.CHANNEL_CLOSED;
    }
    return result;
}
