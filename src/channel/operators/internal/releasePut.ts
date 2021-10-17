import { Channel } from '@Lib/channel';

export function releasePut<T = unknown>(ch: Channel<T>): T | undefined {
    return ch.putBuffer.release();
}
