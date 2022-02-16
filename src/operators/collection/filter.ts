import {
    FlattenChannels,
    Channel,
    ChannelConfiguration,
    waitUntilBufferIsEmptyAsync,
    makeChannel,
    close,
} from '@Lib/channel';
import { createAsyncWrapper } from '@Lib/runner';
import { put } from '../core/put';
import { DefaultResultChannelConfig } from '../config';
import { iterate } from './iterate';
import type { ChannelTransformationResponse } from './entity/channelTransformationResponse';

export function filter<Channels extends Channel<any>[]>(
    filterFn: (data: FlattenChannels<Channels>) => boolean,
    channels: Channels,
    { bufferType, capacity }: ChannelConfiguration = DefaultResultChannelConfig,
): ChannelTransformationResponse<FlattenChannels<Channels>> {
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
            await waitUntilBufferIsEmptyAsync(filteredCh);
            close(filteredCh);
        } catch (e) {
            close(filteredCh);
        }
    })();

    return { ch: filteredCh, promise };
}
