import { FlattenChannel } from '@Lib/channel/entity/flatten';
import { Channel } from '@Lib/channel/entity/channel';
import { errorMessages } from '@Lib/channel/entity/errorMessages';
import { isChannelClosedError } from '@Lib/channel/utils/isChannelClosedError';
import { makeTake } from '../internal/makeTake';
import { releasePut } from '../internal/releasePut';
import { releaseTake } from '../internal/releaseTake';
import { waitForIncomingPut } from '../internal/waitForIncomingPut';
import { waitForTakeQueueToRelease } from '../internal/waitForTakeQueueToRelease';
import { resetChannel } from '../internal/resetChannel';

export function* probe<C extends Channel<NonNullable<any>>>(
    ch: C,
    predicate: (d: FlattenChannel<C>) => boolean,
) {
    let result: FlattenChannel<C> | null | undefined = undefined;
    while (result === undefined) {
        try {
            if (ch.isClosed) {
                throw new Error(errorMessages.CHANNEL_CLOSED);
            }
            console.log('wait for take queue to release', ch.id);
            yield waitForTakeQueueToRelease(ch);
            makeTake(ch);
            console.log('made take', ch.id);
            yield;

            try {
                if (ch.isClosed) {
                    throw new Error(errorMessages.CHANNEL_CLOSED);
                }
                if (ch.putBuffer.getSize() > 0) {
                    const lastItem = ch.putBuffer.preview();
                    console.log('immediate preview', lastItem, ch.id);
                    if (predicate(lastItem)) {
                        result = releasePut(ch);
                    }
                    releaseTake(ch);
                    console.log('continue', ch.id);
                    continue;
                }

                yield waitForIncomingPut(ch);
                const lastItem = ch.putBuffer.preview();
                if (predicate(lastItem)) {
                    result = releasePut(ch);
                }
                releaseTake(ch);
            } catch (e) {
                // If channel closed, cleanup made take
                if (isChannelClosedError(e)) {
                    resetChannel(ch);
                }

                throw e;
            }
        } catch (e) {
            if (isChannelClosedError(e)) {
                result = null;
            } else {
                throw e;
            }
        }
    }
    return result;
}
