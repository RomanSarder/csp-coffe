import { Channel } from '../channel/channel.types';
import { makePut } from './internal';

export function offer<T = unknown>(ch: Channel<T>, data: T): true | null {
    if (data === null) {
        throw new Error('null values are not allowed');
    }

    if (ch.putBuffer.isBlocked() || ch.isClosed) {
        return null;
    }
    makePut(ch, data);
    return true;
}
