import { makeChannel } from '../channel';
import { Channel } from '../channel.types';
import { close, put } from '../operators';
import { iterate } from './iterate';
import { FlattenChannels } from './iteration.types';

export function filter<Channels extends Channel<any>[]>(
    filterFn: (data: FlattenChannels<Channels>) => boolean,
    channels: Channels,
): Channel<FlattenChannels<Channels>> {
    const filteredCh = makeChannel<FlattenChannels<Channels>>();

    const promises = channels.map((ch) => {
        return iterate<FlattenChannels<Channels>>(async (data) => {
            if (filterFn(data)) {
                await put(filteredCh, data);
            }
        }, ch);
    });

    Promise.all(promises).finally(() => {
        close(filteredCh);
    });

    return filteredCh;
}
