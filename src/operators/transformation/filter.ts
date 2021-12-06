import { FlattenChannels } from '@Lib/channel/entity/flatten';
import { Channel } from '@Lib/channel/entity/channel';
import { ChannelConfiguration } from '@Lib/channel/entity/channelConfiguration';
import { makeChannel } from '@Lib/channel/channel';
import { createAsyncWrapper } from '@Lib/shared/utils/createAsyncWrapper';
import { close } from '../close';
import { put } from '../put';
import { DEFAULT_RESULT_CHANNEL_CONFIG } from '../shared/constants';
import { iterate } from './iterate';

export function filter<Channels extends Channel<any>[]>(
    filterFn: (data: FlattenChannels<Channels>) => boolean,
    channels: Channels,
    {
        bufferType,
        capacity,
    }: ChannelConfiguration = DEFAULT_RESULT_CHANNEL_CONFIG,
): { ch: Channel<FlattenChannels<Channels>>; promise: Promise<void> } {
    const filteredCh = makeChannel<FlattenChannels<Channels>>(
        bufferType,
        capacity,
    );

    const promise = (async () => {
        try {
            await createAsyncWrapper(iterate)(function* filterValues(data) {
                if (filterFn(data)) {
                    yield put(filteredCh, data);
                }
            }, ...channels);
        } finally {
            close(filteredCh);
        }
    })();

    return { ch: filteredCh, promise };
}
