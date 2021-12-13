import type { Channel } from '@Lib/channel';
import { Mixer } from './entity/mixer';

export function makeMix(
    destinationCh: Channel<any>,
    soloMode: 'pause' | 'mute' = 'mute',
): Mixer {
    return {
        destinationCh: destinationCh,
        mixedChannelsMap: {},
        soloMode,
    };
}
