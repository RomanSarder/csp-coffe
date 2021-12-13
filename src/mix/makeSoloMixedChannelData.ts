import type { Channel } from '@Lib/channel';
import type { MixedChannelData } from './entity/mixedChannelData';
import type { Mixer } from './entity/mixer';
import { makeMutedMixedChannelData } from './makeMutedMixedChannelData';
import { makeNormalMixedChannelData } from './makeNormalMixedChannelData';
import { makePausedMixedChannelData } from './makePausedMixedChannelData';

export async function makeSoloMixedChannelData(
    mixer: Mixer,
    ch: Channel<any>,
): Promise<MixedChannelData> {
    const promises = Object.keys(mixer.mixedChannelsMap).map((chId) => {
        return (async () => {
            const targetData = mixer.mixedChannelsMap[chId];

            if (targetData.mode !== 'solo') {
                await targetData.cancellablePromise?.cancel();
                if (mixer.soloMode === 'mute' && targetData.mode !== 'mute') {
                    mixer.mixedChannelsMap[chId] = makeMutedMixedChannelData(
                        mixer,
                        targetData.ch as Channel<any>,
                    );
                } else if (
                    mixer.soloMode === 'pause' &&
                    targetData.mode !== 'pause'
                ) {
                    mixer.mixedChannelsMap[chId] = makePausedMixedChannelData();
                }
            }
        })();
    });

    await Promise.all(promises);
    return {
        ...makeNormalMixedChannelData(mixer, ch),
        mode: 'solo',
    };
}
