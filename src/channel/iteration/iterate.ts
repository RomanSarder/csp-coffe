import { Channel } from '../channel.types';

export function iterate<T = unknown>(
    callback: (data: T) => Promise<void>,
    ch: Channel<T>,
) {
    const iterator = ch[Symbol.asyncIterator]();

    async function nextStep(
        res:
            | Promise<IteratorResult<string | T, string>>
            | IteratorResult<string | T, string>,
    ): Promise<any> {
        if (res instanceof Promise) {
            return res.then(nextStep);
        }
        if (res.done) {
            return res.value;
        }
        await callback(res.value as T);
        return nextStep(iterator.next());
    }

    return nextStep(iterator.next());
}
