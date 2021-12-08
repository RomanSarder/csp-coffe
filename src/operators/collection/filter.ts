import { FlattenChannels } from '@Lib/channel/entity/flatten';
import { Channel } from '@Lib/channel/entity/channel';
import { ChannelConfiguration } from '@Lib/channel/entity/channelConfiguration';
import { makeChannel } from '@Lib/channel/channel';
import { createAsyncWrapper } from '@Lib/shared/utils/createAsyncWrapper';
import { close } from '../core/close';
import { put } from '../core/put';
import { DefaultResultChannelConfig } from '../config';
import { iterate } from './iterate';
import { ChannelTransformationResponse } from './entity';

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
        } finally {
            close(filteredCh);
        }
    })();

    return { ch: filteredCh, promise };
}
