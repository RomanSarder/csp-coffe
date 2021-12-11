import type { Channel } from '../entity/channel';
import { Values } from '../entity/privateKeys';

export function hasValues(ch: Channel) {
    return ch[Values].length > 0;
}
