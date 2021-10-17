import {
    makeChannel,
    Channel,
    FlattenChannels,
    ChannelConfiguration,
} from '@Lib/channel';
import { DEFAULT_CHANNEL_CONFIG } from '@Lib/channel/constants';
import { close, put } from '..';
import { iterate } from './iterate';

export function filter<Channels extends Channel<any>[]>(
    filterFn: (data: FlattenChannels<Channels>) => boolean,
    channels: Channels,
    { bufferType, capacity }: ChannelConfiguration = DEFAULT_CHANNEL_CONFIG,
): Channel<FlattenChannels<Channels>> {
    const filteredCh = makeChannel<FlattenChannels<Channels>>(
        bufferType,
        capacity,
    );

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
