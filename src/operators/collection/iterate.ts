import type { CancellablePromise } from '@Lib/cancellablePromise';
import type { FlattenChannels, FlattenChannel, Channel } from '@Lib/channel';

import { call } from '@Lib/go';

import { all } from '../combinators/all';
import { probe } from '../core/probe';

function* iterateOverSingleChannel<C extends Channel<any>>(
    callback: (data: FlattenChannel<C>) => void,
    predicate: (data: FlattenChannel<C>) => boolean,
    ch: C,
) {
    while (!ch.isClosed) {
        const result: FlattenChannel<C> = yield probe(ch, predicate);
        if (result !== null) {
            yield call(callback, result);
        }
        yield;
    }
}

export function* iterate<Channels extends Channel<any>[]>(
    callback: (data: FlattenChannels<Channels>) => any,
    predicate: (data: FlattenChannels<Channels>) => boolean,
    ...chs: Channels
) {
    const instructions = chs.map((ch) =>
        call(iterateOverSingleChannel, callback, predicate, ch),
    );

    const task: CancellablePromise<any> = yield all(...instructions);
    return task;
}
