import { Channel } from '@Lib/channel/channel.types';

export function makeTake<T = unknown>(ch: Channel<T>) {
    ch.takeBuffer.add(null);
}
