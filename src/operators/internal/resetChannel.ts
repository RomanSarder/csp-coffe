import { BufferType } from '@Lib/buffer/entity/bufferType';
import { makeBuffer } from '@Lib/buffer/buffer';
import { Channel } from '@Lib/channel/entity/channel';
import { close } from '../core/close';

export function resetChannel<T = unknown>(ch: Channel<T>) {
    // eslint-disable-next-line no-param-reassign
    ch.putBuffer = makeBuffer<T>(BufferType.CLOSED);
    // eslint-disable-next-line no-param-reassign
    ch.takeBuffer = makeBuffer<null>(BufferType.CLOSED);
    // eslint-disable-next-line no-param-reassign
    close(ch);
    // eslint-disable-next-line no-param-reassign
    ch.isBuffered = false;
}
