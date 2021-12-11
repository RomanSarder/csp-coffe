import { BufferType, makeBuffer } from '@Lib/buffer';
import type { Channel } from '@Lib/channel';
import { close } from './close';
import { PutBuffer, TakeBuffer, Values } from '../entity/privateKeys';
import type { PutRequest } from '../entity/putRequest';
import type { TakeRequest } from '../entity/takeRequest';

export function resetChannel<T = unknown>(ch: Channel<T>) {
    // eslint-disable-next-line no-param-reassign
    ch[PutBuffer] = makeBuffer<PutRequest>(BufferType.CLOSED);
    // eslint-disable-next-line no-param-reassign
    ch[TakeBuffer] = makeBuffer<TakeRequest>(BufferType.CLOSED);
    ch[Values] = [];
    // eslint-disable-next-line no-param-reassign
    close(ch);
    // eslint-disable-next-line no-param-reassign
    ch.isBuffered = false;
}
