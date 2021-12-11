import type { Channel } from '../entity/channel';

export function isChannelClosed(ch: Channel<any>) {
    return ch.isClosed;
}
