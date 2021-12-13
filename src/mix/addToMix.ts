import type { Channel } from '@Lib/channel';
import type { Mixer } from './entity/mixer';
import type { MixOptions } from './entity/mixOptions';
import { makePausedMixedChannelData } from './handlers';
import { makeMutedMixedChannelData } from './makeMutedMixedChannelData';
import { makeNormalMixedChannelData } from './makeNormalMixedChannelData';
import { makeSoloMixedChannelData } from './makeSoloMixedChannelData';

export async function addToMix(
    mixer: Mixer,
    ch: Channel<any>,
    option: MixOptions = 'normal',
) {
    if (mixer.mixedChannelsMap[ch.id]) {
        await mixer.mixedChannelsMap[ch.id].cancellablePromise?.cancel();
    }
    switch (option) {
        case 'normal': {
            mixer.mixedChannelsMap[ch.id] = makeNormalMixedChannelData(
                mixer,
                ch,
            );
            break;
        }
        case 'mute': {
            mixer.mixedChannelsMap[ch.id] = makeMutedMixedChannelData(
                mixer,
                ch,
            );
            break;
        }
        case 'pause': {
            mixer.mixedChannelsMap[ch.id] = makePausedMixedChannelData();
            break;
        }
        case 'solo': {
            mixer.mixedChannelsMap[ch.id] = await makeSoloMixedChannelData(
                mixer,
                ch,
            );
        }
    }
}
