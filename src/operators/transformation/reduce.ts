import {
    makeChannel,
    Channel,
    FlattenChannels,
    ChannelConfiguration,
} from '@Lib/channel';
import { closeOnAllValuesTaken } from '@Lib/channel/proxy';
import { put } from '..';
import { DEFAULT_RESULT_CHANNEL_CONFIG } from '../shared/constants';
import { iterate } from './iterate';

export function reduce<Channels extends Channel<any>[], A = unknown>(
    reducer: (acc: A, data: FlattenChannels<Channels>) => A,
    acc: A,
    channels: Channels,
    {
        bufferType,
        capacity,
    }: ChannelConfiguration = DEFAULT_RESULT_CHANNEL_CONFIG,
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
    });

    return closeOnAllValuesTaken(reducedCh);
}
