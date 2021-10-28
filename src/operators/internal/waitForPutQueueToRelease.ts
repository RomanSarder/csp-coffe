import { Channel } from '@Lib/channel';
import { errorMessages } from '@Lib/channel/constants';
import { Instruction } from '@Lib/go/entity';
import {
    makeContinueInstruction,
    makeExecuteInstruction,
    makeParkCommand,
} from '@Lib/go';

export const WAIT_FOR_PUT_QUEUE_TO_RELEASE = 'WAIT_FOR_PUT_QUEUE_TO_RELEASE';

export function* waitForPutQueueToReleaseGenerator<C extends Channel<any>>(
    ch: C,
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

export function waitForPutQueueToRelease<C extends Channel<any>>(
    ch: C,
): Instruction<Generator> {
    return makeExecuteInstruction(
        {
            name: WAIT_FOR_PUT_QUEUE_TO_RELEASE,
            function: waitForPutQueueToReleaseGenerator,
        },
        [ch],
    );
}
