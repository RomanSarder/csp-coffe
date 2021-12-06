import { FlattenChannels } from '@Lib/channel/entity/flatten';
import { Channel } from '@Lib/channel/entity/channel';
import { ChannelConfiguration } from '@Lib/channel/entity/channelConfiguration';
import { makeChannel } from '@Lib/channel/channel';
import { createAsyncWrapper } from '@Lib/shared/utils/createAsyncWrapper';
import { close } from '../core/close';
import { put } from '../core/put';
import { DefaultResultChannelConfig } from '../config';
import { iterate } from './iterate';

export function map<
    Channels extends Channel<any>[],
    M extends NonNullable<any> = any,
>(
    mapFn: (data: FlattenChannels<Channels>) => M,
    channels: Channels,
    { bufferType, capacity }: ChannelConfiguration = DefaultResultChannelConfig,
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
