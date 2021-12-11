import type { Channel } from '../entity/channel';
import { PutBuffer } from '../entity/privateKeys';

export function isPutBlocked(ch: Channel<any>): boolean {
    return ch[PutBuffer].isBlocked();
}
