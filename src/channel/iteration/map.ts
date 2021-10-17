import { BufferType } from '@Lib/buffer';
import { makeChannel } from '../channel';
import { Channel, FlattenChannels } from '../channel.types';
import { close, put } from '../operators';
import { iterate } from './iterate';
import { OutputChannelConfig } from './iteration.types';

export function map<Channels extends Channel<any>[], M = unknown>(
    mapFn: (data: FlattenChannels<Channels>) => M,
    channels: Channels,
    { bufferType, capacity }: OutputChannelConfig = {
        bufferType: BufferType.FIXED,
        capacity: 1,
    },
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
