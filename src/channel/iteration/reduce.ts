import { makeChannel } from '../channel';
import { Channel } from '../channel.types';
import { close, put } from '../operators';
import { iterate } from './iterate';
import { FlattenChannels } from './iteration.types';

export function reduce<Channels extends Channel<any>[], A = unknown>(
    reducer: (acc: A, data: FlattenChannels<Channels>) => A,
    acc: A,
    channels: Channels,
): Channel<A> {
    const reducedCh = makeChannel<A>();
    let result = acc;
    const promises = channels.map((ch) => {
        return iterate<FlattenChannels<Channels>>(async (data) => {
            result = reducer(result, data);
        }, ch);
    });

    Promise.all(promises).finally(async () => {
        await put(reducedCh, result);
        close(reducedCh);
    });

    return reducedCh;
}
