import type { Channel } from '../entity/channel';
import { Values } from '../entity/privateKeys';

export function push<T>(ch: Channel<T>, data: T) {
    if (data === null) {
        throw new Error('Cannot put a null value into the channel');
    }

    ch[Values].push(data);
}
