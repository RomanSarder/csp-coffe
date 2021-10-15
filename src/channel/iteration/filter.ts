import { makeChannel, put } from '../channel';
import { Channel } from '../channel.types';
import { iterate } from './iterate';

export function filter<T = unknown>(
    filterFn: (data: T) => boolean,
    ch: Channel<T>,
): Channel<T> {
    const mappedCh = makeChannel<T>();

    iterate<T>(async (data) => {
        if (filterFn(data)) {
            await put(mappedCh, data);
        }
    }, ch);

    return mappedCh;
}
