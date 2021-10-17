import { makeChannel } from '../channel';
import { Channel } from '../channel.types';
import { close, put } from '../operators';
import { iterate } from './iterate';

export function map<T = unknown, M = unknown>(
    mapFn: (data: T) => M,
    ch: Channel<T>,
): Channel<M> {
    const mappedCh = makeChannel<M>();

    iterate<T>(async (data) => {
        await put(mappedCh, mapFn(data));
    }, ch).then(() => {
        close(mappedCh);
    });

    return mappedCh;
}
