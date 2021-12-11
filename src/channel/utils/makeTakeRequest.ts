import type { Channel } from '@Lib/channel';
import { takeRequest } from '../config';
import { TakeBuffer } from '../entity/privateKeys';

export function makeTakeRequest<T = unknown>(ch: Channel<T>) {
    ch[TakeBuffer].add(takeRequest);
}
