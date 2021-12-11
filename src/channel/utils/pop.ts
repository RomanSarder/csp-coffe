import type { Channel } from '../entity/channel';
import { Values } from '../entity/privateKeys';

export function pop<T>(ch: Channel<T>): T | undefined {
    return ch[Values].shift() as T;
}
