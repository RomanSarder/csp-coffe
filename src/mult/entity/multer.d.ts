import { CancellablePromise } from '@Lib/cancellablePromise';
import type { Channel } from '@Lib/channel';
import type { MultedChannelCallbacks } from './multedChannelCallbacks';

export type Multer<T> = {
    sourceChannel: Channel<T>;
    multedChannelCallbacks: MultedChannelCallbacks;
    cancellablePromise: CancellablePromise<any>;
};
