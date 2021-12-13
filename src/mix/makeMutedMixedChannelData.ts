import type { Channel } from '@Lib/channel';
import type { MixedChannelData } from './entity/mixedChannelData';
import type { Mixer } from './entity/mixer';
import { mutedChannelHandler } from './handlers';
import { runMixedChannelConsumption } from './runMixedChannelConsuption';

export function makeMutedMixedChannelData(
    mixer: Mixer,
    ch: Channel<any>,
): MixedChannelData {
    return {
        handler: mutedChannelHandler,
        cancellablePromise: runMixedChannelConsumption(mixer, ch),
        mode: 'mute',
        ch,
    };
}
