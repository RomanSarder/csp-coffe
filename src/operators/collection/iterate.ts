import type { CancellablePromise } from '@Lib/cancellablePromise/entity/cancellablePromise';
import { FlattenChannels, FlattenChannel } from '@Lib/channel/entity/flatten';
import { Channel } from '@Lib/channel/entity/channel';

import { call } from '@Lib/go/instructions/call';

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
