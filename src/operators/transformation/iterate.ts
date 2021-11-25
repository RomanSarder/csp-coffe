import { CancellablePromise } from '@Lib/cancellablePromise';
import { Channel, FlattenChannel } from '@Lib/channel/channel.types';
import { call } from '@Lib/go';
import { all } from '../flow';
import { take } from '../take';

function* iterateOverSingleChannel<C extends Channel<any>>(
    callback: (data: FlattenChannel<C>) => void,
    ch: C,
) {
    while (!ch.isClosed) {
        const result: FlattenChannel<C> = yield take(ch);
        yield call(callback, result);
    }
}

export function* iterate<T extends NonNullable<any>>(
    callback: (data: T) => void,
    ...chs: Channel<T>[]
) {
    const instructions = chs.map((ch) =>
        call(iterateOverSingleChannel, callback, ch),
    );

    const task: CancellablePromise<any> = yield all(...instructions);

    return task;
}
