import { Channel } from '@Lib/channel/channel.types';

export function releaseTake<T = unknown>(ch: Channel<T>) {
    ch.takeBuffer.release();
}
