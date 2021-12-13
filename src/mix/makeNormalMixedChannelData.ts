import type { Channel } from '@Lib/channel';
import type { MixedChannelData } from './entity/mixedChannelData';
import type { Mixer } from './entity/mixer';
import { makeNormalMixedChannelHandler } from './handlers';
import { runMixedChannelConsumption } from './runMixedChannelConsuption';

export function makeNormalMixedChannelData(
    mixer: Mixer,
    ch: Channel<any>,
): MixedChannelData {
    return {
        handler: makeNormalMixedChannelHandler(mixer.destinationCh),
        cancellablePromise: runMixedChannelConsumption(mixer, ch),
        option: 'normal',
    };
}
