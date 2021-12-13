import type { MixedChannelData } from './entity/mixedChannelData';
import { mutedChannelHandler } from './handlers';

export function makePausedMixedChannelData(): MixedChannelData {
    return {
        handler: mutedChannelHandler,
        cancellablePromise: undefined,
        mode: 'pause',
        ch: undefined,
    };
}
