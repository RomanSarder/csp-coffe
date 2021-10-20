import {
    Channel,
    ChannelConfiguration,
    FlattenChannels,
    makeChannel,
} from '@Lib/channel';
import { close, iterate, put } from '..';
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
