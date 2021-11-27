import { CancellablePromise } from '@Lib/cancellablePromise';
import {
    Channel,
    FlattenChannel,
    FlattenChannels,
} from '@Lib/channel/channel.types';
import { call } from '@Lib/go';
import { Events } from '@Lib/channel/constants';

import { all } from '../flow';
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
