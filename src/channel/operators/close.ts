import { Channel } from '../channel.types';

export function close<T = unknown>(ch: Channel<T>) {
    // eslint-disable-next-line no-param-reassign
    ch.isClosed = true;
}
