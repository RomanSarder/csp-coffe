import {
    Channel,
    FlattenChannels,
    ChannelConfiguration,
} from '@Lib/channel/channel.types';
import { makeChannel } from '@Lib/channel/channel';
import { createAsyncWrapper } from '@Lib/shared/utils/createAsyncWrapper';
import { close } from '../close';
import { put } from '../put';
import { DEFAULT_RESULT_CHANNEL_CONFIG } from '../shared/constants';
import { iterate } from './iterate';

export function map<
    Channels extends Channel<any>[],
    M extends NonNullable<any> = any,
>(
    mapFn: (data: FlattenChannels<Channels>) => M,
    channels: Channels,
    {
        bufferType,
        capacity,
    }: ChannelConfiguration = DEFAULT_RESULT_CHANNEL_CONFIG,
): { ch: Channel<M>; promise: Promise<void> } {
    const mappedCh = makeChannel<M>(bufferType, capacity);

    const promise = (async () => {
        try {
            await createAsyncWrapper(iterate)(function* mapValues(data) {
                yield put(mappedCh, mapFn(data as FlattenChannels<Channels>));
            }, ...channels);
        } finally {
            close(mappedCh);
        }
    })();

    return { ch: mappedCh, promise };
}
