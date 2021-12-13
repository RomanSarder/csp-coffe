import type { Channel } from '@Lib/channel';

export interface MultedChannelCallback<T = any> {
    (data: T): boolean;
    ch: Channel<any>;
}
