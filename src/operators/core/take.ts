import { FlattenChannel } from '@Lib/channel/entity/flatten';
import { Channel } from '@Lib/channel/entity/channel';
import { Events } from '@Lib/channel/entity/events';
import { probe } from './probe';

export const TAKE = 'TAKE';

export function* take<C extends Channel<NonNullable<any>>>(ch: C) {
    const result: FlattenChannel<C> | null = yield probe(ch, () => true);
    if (result === null) {
        return Events.CHANNEL_CLOSED;
    }
    return result;
}
