import { Channel } from '@Lib/channel';
import { errorMessages } from '@Lib/channel/constants';
import { Instruction } from '@Lib/go/entity';
import { makeContinueInstruction, makeParkCommand } from '@Lib/go';

export const WAIT_FOR_PUT_QUEUE_TO_RELEASE = 'WAIT_FOR_PUT_QUEUE_TO_RELEASE';

export function* waitForPutQueueToRelease<T = unknown>(
    ch: Channel<T>,
): Generator<Instruction<unknown>> {
    if (ch.isClosed) {
        throw new Error(errorMessages.CHANNEL_CLOSED);
    }
    while (ch.putBuffer.isBlocked()) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        yield makeParkCommand();
    }
    return makeContinueInstruction();
}
