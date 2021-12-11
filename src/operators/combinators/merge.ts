import type {
    ChannelConfiguration,
    Channel,
    FlattenChannels,
} from '@Lib/channel';
import { makeChannel } from '@Lib/channel';
import { createAsyncWrapper } from '@Lib/runner';
import { close } from '@Lib/channel';
import { put } from '../core/put';
import { iterate } from '../collection/iterate';
import { DefaultResultChannelConfig } from '../config';

export function merge<
    Channels extends Channel<any>[],
    AggregatedType = FlattenChannels<Channels>,
>(
    channels: Channels,
    { bufferType, capacity }: ChannelConfiguration = DefaultResultChannelConfig,
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
