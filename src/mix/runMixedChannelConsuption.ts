import type { Mixer } from './entity/mixer';
import type { Channel } from '@Lib/channel';
import { runIterator } from '@Lib/runner';
import { iterate } from '@Lib/operators';

export const runMixedChannelConsumption = (mixer: Mixer, ch: Channel<any>) => {
    return runIterator(
        (function* () {
            yield iterate(mixer.mixedChannelsMap[ch.id].handler, ch);
        })(),
    );
};
