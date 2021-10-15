import { makeChannel, put } from '../channel';
import { Channel } from '../channel.types';
import { iterate } from './iterate';

export function map<T = unknown, M = unknown>(
    mapFn: (data: T) => M,
    ch: Channel<T>,
): Channel<M> {
    const mappedCh = makeChannel<M>();

    iterate<T>(async (data) => {
        await put(mappedCh, mapFn(data));
    }, ch);

    return mappedCh;
}
