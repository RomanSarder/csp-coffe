import { makeChannel } from '../channel';
import { Channel } from '../channel.types';
import { close, put } from '../operators';
import { iterate } from './iterate';
import { FlattenChannels } from './iteration.types';

export function map<Channels extends Channel<any>[], M = unknown>(
    mapFn: (data: FlattenChannels<Channels>) => M,
    channels: Channels,
): Channel<M> {
    const mappedCh = makeChannel<M>();
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
