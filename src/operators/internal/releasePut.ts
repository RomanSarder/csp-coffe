import type { Channel, FlattenChannel } from '@Lib/channel';

export function releasePut<C extends Channel<any>>(
    ch: C,
): FlattenChannel<C> | undefined {
    return ch.putBuffer.release();
}
