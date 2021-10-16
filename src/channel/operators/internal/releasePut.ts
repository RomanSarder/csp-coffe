import { Channel } from '@Lib/channel/channel.types';

export function releasePut<T = unknown>(ch: Channel<T>): T | undefined {
    return ch.putBuffer.release();
}
