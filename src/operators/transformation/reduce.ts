import {
    makeChannel,
    Channel,
    FlattenChannels,
    ChannelConfiguration,
} from '@Lib/channel';
import { DEFAULT_CHANNEL_CONFIG } from '@Lib/channel/constants';
import { close, put } from '..';
import { iterate } from './iterate';

export function reduce<Channels extends Channel<any>[], A = unknown>(
    reducer: (acc: A, data: FlattenChannels<Channels>) => A,
    acc: A,
    channels: Channels,
    { bufferType, capacity }: ChannelConfiguration = DEFAULT_CHANNEL_CONFIG,
): Channel<A> {
    const reducedCh = makeChannel<A>(bufferType, capacity);
    let result = acc;
    const promises = channels.map((ch) => {
        return iterate<FlattenChannels<Channels>>(async (data) => {
            result = reducer(result, data);
        }, ch);
    });

    Promise.all(promises).finally(async () => {
        await put(reducedCh, result);
        close(reducedCh);
    });

    return reducedCh;
}
