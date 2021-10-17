import { Channel } from '@Lib/channel';

export function releaseTake<T = unknown>(ch: Channel<T>) {
    ch.takeBuffer.release();
}
