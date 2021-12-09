import type {
    FlattenChannels,
    Channel,
    ChannelConfiguration,
} from '@Lib/channel';
import { makeChannel } from '@Lib/channel';
import { createAsyncWrapper } from '@Lib/runner';
import { close } from '../core/close';
import { put } from '../core/put';
import { DefaultResultChannelConfig } from '../config';
import { iterate } from './iterate';
import { ChannelTransformationResponse } from './entity';
import { constant } from '@Lib/shared/utils';

export function map<
    Channels extends Channel<any>[],
    M extends NonNullable<any> = any,
>(
    mapFn: (data: FlattenChannels<Channels>) => M,
    channels: Channels,
    { bufferType, capacity }: ChannelConfiguration = DefaultResultChannelConfig,
): ChannelTransformationResponse<M> {
    const mappedCh = makeChannel<M>(bufferType, capacity);

    const promise = (async () => {
        try {
            await createAsyncWrapper(iterate)(
                function* mapValues(data) {
                    yield put(
                        mappedCh,
                        mapFn(data as FlattenChannels<Channels>),
                    );
                },
                constant(true),
                ...channels,
            );
        } finally {
            close(mappedCh);
        }
    })();

    return { ch: mappedCh, promise };
}
