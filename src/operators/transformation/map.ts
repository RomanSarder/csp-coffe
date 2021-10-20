import {
    makeChannel,
    Channel,
    FlattenChannels,
    ChannelConfiguration,
} from '@Lib/channel';
import { close, put } from '..';
import { DEFAULT_RESULT_CHANNEL_CONFIG } from '../shared/constants';
import { iterate } from './iterate';

export function map<Channels extends Channel<any>[], M = unknown>(
    mapFn: (data: FlattenChannels<Channels>) => M,
    channels: Channels,
    {
        bufferType,
        capacity,
    }: ChannelConfiguration = DEFAULT_RESULT_CHANNEL_CONFIG,
): Channel<M> {
    const mappedCh = makeChannel<M>(bufferType, capacity);
    const promises = channels.map((ch) => {
        return iterate<FlattenChannels<Channels>>(async (data) => {
            await put(mappedCh, mapFn(data));
        }, ch);
    });

    Promise.all(promises).finally(() => {
        close(mappedCh);
    });

    return mappedCh;
}
