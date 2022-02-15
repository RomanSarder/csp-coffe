import { BufferType } from '@Lib/buffer';
import type { Channel } from '../entity/channel';
import { PutBuffer, Values } from '../entity/privateKeys';

export function push<T>(ch: Channel<T>, data: T) {
    if (data === null) {
        throw new Error('Cannot put a null value into the channel');
    }
    if (
        ch[PutBuffer].type === BufferType.UNBLOCKING ||
        ch[Values].length < ch.capacity
    ) {
        ch[Values].push(data);
        return true;
    }
    return false;
}
