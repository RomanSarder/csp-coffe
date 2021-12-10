import type { CancellablePromise } from '@Lib/cancellablePromise';
import { FlattenChannels, FlattenChannel, Channel, Events } from '@Lib/channel';

import { call } from '../core/call';

import { all } from '../combinators/all';
import { take } from '../core/take';

function* iterateOverSingleChannel<C extends Channel<any>>(
    callback: (data: FlattenChannel<C>) => void,
    ch: C,
) {
    while (!ch.isClosed) {
        const result: FlattenChannel<C> = yield take(ch);
        if (result !== Events.CHANNEL_CLOSED) {
            yield call(callback, result);
        }
        yield;
    }
}

export function* iterate<Channels extends Channel<any>[]>(
    callback: (data: FlattenChannels<Channels>) => any,
    ...chs: Channels
) {
    const instructions = chs.map((ch) =>
        call(iterateOverSingleChannel, callback, ch),
    );

    const task: CancellablePromise<any> = yield all(...instructions);
    return task;
}
