import {
    Channel,
    ChannelConfiguration,
    FlattenChannels,
} from '@Lib/channel/channel.types';
import { makeChannel } from '@Lib/channel/channel';
import { createAsyncWrapper } from '@Lib/shared/utils/createAsyncWrapper';
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
): { ch: Channel<AggregatedType>; promise: Promise<void> } {
    const mergedChannel = makeChannel<AggregatedType>(bufferType, capacity);
    const promise = (async () => {
        try {
            await createAsyncWrapper(iterate)(function* mapValues(data) {
                yield put(mergedChannel, data);
            }, ...channels);
        } finally {
            close(mergedChannel);
        }
    })();

    return { ch: mergedChannel, promise };
}
