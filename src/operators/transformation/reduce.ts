import { FlattenChannels } from '@Lib/channel/entity/flatten';
import { Channel } from '@Lib/channel/entity/channel';
import { ChannelConfiguration } from '@Lib/channel/entity/channelConfiguration';
import { makeChannel } from '@Lib/channel/channel';
import { closeOnAllValuesTaken } from '@Lib/channel/proxy/closeOnAllValuesTaken';
import { createAsyncWrapper } from '@Lib/shared/utils/createAsyncWrapper';
import { putAsync } from '../core/putAsync';
import { DefaultResultChannelConfig } from '../config';
import { iterate } from './iterate';

export function reduce<Channels extends Channel<any>[], A = unknown>(
    reducer: (acc: A, data: FlattenChannels<Channels>) => A,
    acc: A,
    channels: Channels,
    { bufferType, capacity }: ChannelConfiguration = DefaultResultChannelConfig,
): { ch: Channel<A>; promise: Promise<void> } {
    const reducedCh = makeChannel<A>(bufferType, capacity);
    let result = acc;

    const promise = (async () => {
        try {
            await createAsyncWrapper(iterate)(function reduceValues(data) {
                result = reducer(result, data);
            }, ...channels);
        } finally {
            await putAsync(reducedCh, result);
        }
    })();

    return { ch: closeOnAllValuesTaken(reducedCh), promise };
}
