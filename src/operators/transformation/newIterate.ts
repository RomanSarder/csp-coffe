import { Events, FlattenChannel } from '@Lib/channel';
import { pollFn } from '..';
import { Channel } from '../../channel/channel.types';

export function* iterate<C extends Channel<any>>(
    callback: (data: FlattenChannel<C> | Events.CHANNEL_CLOSED) => void,
    ch: C,
): Generator<FlattenChannel<C> | null, void, FlattenChannel<C> | null> {
    while (!ch.isClosed) {
        const result = yield pollFn<C>(ch);
        if (result !== null) {
            callback(result);
        }
    }
    callback(Events.CHANNEL_CLOSED);
}
