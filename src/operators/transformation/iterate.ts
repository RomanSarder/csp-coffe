import type { CancellablePromise } from '@Lib/cancellablePromise/entity/cancellablePromise';
import { FlattenChannels, FlattenChannel } from '@Lib/channel/entity/flatten';
import { Channel } from '@Lib/channel/entity/channel';

import { call } from '@Lib/go';
import { Events } from '@Lib/channel/entity/events';

import { all } from '../combinators/all';
import { take } from '../take';

function* iterateOverSingleChannel<C extends Channel<any>>(
    callback: (data: FlattenChannel<C>) => void,
    ch: C,
) {
    while (!ch.isClosed) {
        const result: FlattenChannel<C> = yield take(ch);
        if (result !== Events.CHANNEL_CLOSED) {
            yield call(callback, result);
        }
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
