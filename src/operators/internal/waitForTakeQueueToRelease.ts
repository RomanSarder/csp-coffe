import { Channel } from '@Lib/channel';
import { errorMessages } from '@Lib/channel/constants';
import { Instruction } from '@Lib/go/entity';
import { makeExecuteInstruction, makeParkCommand } from '@Lib/go';

export const WAIT_FOR_TAKE_QUEUE_TO_RELEASE = 'WAIT_FOR_TAKE_QUEUE_TO_RELEASE';

export function* waitForTakeQueueToReleaseGenerator<C extends Channel<any>>(
    ch: C,
): Generator<Instruction<unknown>> {
    while (ch.takeBuffer.isBlocked()) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        yield makeParkCommand();
    }
}

export function waitForTakeQueueToRelease<C extends Channel<any>>(
    ch: C,
): Instruction<Generator> {
    return makeExecuteInstruction(
        {
            name: WAIT_FOR_TAKE_QUEUE_TO_RELEASE,
            function: waitForTakeQueueToReleaseGenerator,
        },
        [ch],
    );
}
