import { MixOptions } from './mixOptions';
import type { CancellablePromise } from '@Lib/cancellablePromise';
import { Channel } from '@Lib/channel';

export type MixedChannelData = {
    mode: MixOptions;
    ch: Channel<any> | undefined;
    cancellablePromise: CancellablePromise<any> | undefined;
    handler: any;
};
