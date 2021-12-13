import type { Channel } from '@Lib/channel';
import type { MixedChannelsMap } from './mixedChannelsMap';
import type { MixOptions } from './mixOptions';

export type Mixer = {
    destinationCh: Channel<any>;
    mixedChannelsMap: MixedChannelsMap;
    soloMode: Extract<MixOptions, 'pause' | 'mute'>;
};
