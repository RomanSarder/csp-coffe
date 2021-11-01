import { Channel, FlattenChannel } from '@Lib/channel';
import { makeCallInstruction } from '@Lib/go';
import { releasePut } from './internal';

const POLL = 'POLL';
export function pollFn<C extends Channel<any>>(
    ch: C,
): FlattenChannel<C> | null {
    if (!ch.isClosed && ch.putBuffer.getSize() > 0) {
        return releasePut(ch) ?? null;
    }
    return null;
}

export function poll<C extends Channel<any>>(ch: C) {
    return makeCallInstruction(
        {
            name: POLL,
            function: pollFn,
        },
        [ch],
    );
}
