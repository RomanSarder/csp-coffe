import { makeChannel, put } from '../channel';
import { Channel } from '../channel.types';
import { iterate } from './iterate';

export function reduce<T = unknown, A = unknown>(
    reducer: (acc: A, data: T) => A,
    acc: A,
    ch: Channel<T>,
): Channel<A> {
    const reducedCh = makeChannel<A>();
    let result = acc;

    iterate<T>(async (data) => {
        result = reducer(result, data);
    }, ch).then(async () => {
        await put(reducedCh, result);
    });

    return reducedCh;
}
