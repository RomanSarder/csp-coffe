import { Channel, FlattenChannel } from '@Lib/channel/channel.types';

export function releasePut<C extends Channel<any>>(
    ch: C,
): FlattenChannel<C> | undefined {
    return ch.putBuffer.release();
}
