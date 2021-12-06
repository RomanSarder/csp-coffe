import { Channel } from '@Lib/channel/entity/channel';

export function makeTake<T = unknown>(ch: Channel<T>) {
    ch.takeBuffer.add(null);
}
