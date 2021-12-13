import type { Channel } from '@Lib/channel';
import type { MixedChannelData } from './entity/mixedChannelData';
import type { Mixer } from './entity/mixer';
import { mutedChannelHandler } from './handlers';
import { makeNormalMixedChannelData } from './makeNormalMixedChannelData';

export async function makeSoloMixedChannelData(
    mixer: Mixer,
    ch: Channel<any>,
): Promise<MixedChannelData> {
    const promises = Object.keys(mixer.mixedChannelsMap).map((chId) => {
        return (async () => {
            const targetData = mixer.mixedChannelsMap[chId];

            if (targetData.option !== 'solo') {
                if (mixer.soloMode === 'mute') {
                    targetData.handler = mutedChannelHandler;
                    targetData.option = 'mute';
                } else if (mixer.soloMode === 'pause') {
                    await targetData.cancellablePromise?.cancel();
                    targetData.cancellablePromise = undefined;
                    targetData.handler = mutedChannelHandler;
                    targetData.option = 'pause';
                }
            }
        })();
    });

    await Promise.all(promises);

    return {
        ...makeNormalMixedChannelData(mixer, ch),
        option: 'solo',
    };
}
