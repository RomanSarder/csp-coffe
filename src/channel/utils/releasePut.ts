import type { Channel } from '@Lib/channel';
import { PutBuffer } from '../entity/privateKeys';

export function releasePut<C extends Channel<any>>(ch: C): void {
    ch[PutBuffer].release();
}
