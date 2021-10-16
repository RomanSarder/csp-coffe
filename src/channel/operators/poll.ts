import { Channel } from '../channel.types';
import { releasePut } from './internal';

export function poll<T = unknown>(ch: Channel<T>): T | null {
    if (!ch.isClosed && ch.putBuffer.getSize() > 0) {
        return releasePut(ch) as T;
    }
    return null;
}
