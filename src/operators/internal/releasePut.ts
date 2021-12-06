import { FlattenChannel } from '@Lib/channel/entity/flatten';
import { Channel } from '@Lib/channel/entity/channel';

export function releasePut<C extends Channel<any>>(
    ch: C,
): FlattenChannel<C> | undefined {
    return ch.putBuffer.release();
}
