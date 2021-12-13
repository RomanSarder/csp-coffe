import { MixOptions } from './mixOptions';
import type { CancellablePromise } from '@Lib/cancellablePromise';

export type MixedChannelData = {
    option: MixOptions;
    cancellablePromise: CancellablePromise<any> | undefined;
    handler: any;
};
