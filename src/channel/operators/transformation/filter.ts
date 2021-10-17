import { BufferType } from '@Lib/buffer';
import { makeChannel } from '../../channel';
import { Channel, FlattenChannels } from '../../channel.types';
import { close, put } from '..';
import { iterate } from './iterate';
import { OutputChannelConfig } from './iteration.types';

export function filter<Channels extends Channel<any>[]>(
    filterFn: (data: FlattenChannels<Channels>) => boolean,
    channels: Channels,
    { bufferType, capacity }: OutputChannelConfig = {
        bufferType: BufferType.FIXED,
        capacity: 1,
    },
): Channel<FlattenChannels<Channels>> {
    const filteredCh = makeChannel<FlattenChannels<Channels>>(
        bufferType,
        capacity,
    );

    const promises = channels.map((ch) => {
        return iterate<FlattenChannels<Channels>>(async (data) => {
            if (filterFn(data)) {
                await put(filteredCh, data);
            }
        }, ch);
    });

    Promise.all(promises).finally(() => {
        close(filteredCh);
    });

    return filteredCh;
}
