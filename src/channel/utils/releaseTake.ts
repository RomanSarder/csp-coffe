import type { Channel } from '@Lib/channel';
import { TakeBuffer } from '../entity/privateKeys';

export function releaseTake<T = unknown>(ch: Channel<T>) {
    ch[TakeBuffer].release();
}
