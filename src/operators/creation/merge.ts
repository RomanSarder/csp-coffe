import {
    Channel,
    ChannelConfiguration,
    FlattenChannels,
} from '@Lib/channel/channel.types';
import { makeChannel } from '@Lib/channel/channel';
import { close } from '../close';
import { put } from '../put';
import { iterate } from '../transformation/iterate';
import { DEFAULT_RESULT_CHANNEL_CONFIG } from '../shared/constants';

export function merge<
    Channels extends Channel<any>[],
    AggregatedType = FlattenChannels<Channels>,
>(
    channels: Channels,
    {
        bufferType,
        capacity,
    }: ChannelConfiguration = DEFAULT_RESULT_CHANNEL_CONFIG,
): Channel<AggregatedType> {
    const mergedChannel = makeChannel<AggregatedType>(bufferType, capacity);
    const promises = channels.map((ch) => {
        return iterate<AggregatedType>(async (data) => {
            await put(mergedChannel, data);
        }, ch);
    });

    Promise.all(promises).finally(() => {
        close(mergedChannel);
    });

    return mergedChannel;
}
