import { Channel } from '@Lib/channel';

export function makePut<T = unknown>(ch: Channel<T>, data: T) {
    if (data === null) {
        throw new Error('null values are not allowed');
    }

    ch.putBuffer.add(data);
}
