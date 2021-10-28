import { Channel } from '@Lib/channel';
import { errorMessages } from '@Lib/channel/constants';
import { Instruction } from '@Lib/go/entity';
import { makeExecuteInstruction, makeParkCommand } from '@Lib/go';

export const WAIT_FOR_INCOMING_PUT = 'WAIT_FOR_INCOMING_PUT';

export function* waitForIncomingPutGenerator<C extends Channel<any>>(
    ch: C,
): Generator<Instruction> {
    if (ch.isClosed) {
        throw new Error(errorMessages.CHANNEL_CLOSED);
    }

    while (ch.putBuffer.getSize() === 0) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        yield makeParkCommand();
    }
}

export function waitForIncomingPut<T = unknown>(
    ch: Channel<T>,
): Instruction<Generator> {
    return makeExecuteInstruction(
        {
            name: WAIT_FOR_INCOMING_PUT,
            function: waitForIncomingPutGenerator,
        },
        [ch],
    );
}
