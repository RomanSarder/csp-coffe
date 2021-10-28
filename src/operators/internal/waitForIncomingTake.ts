import { Channel } from '@Lib/channel';
import { errorMessages } from '@Lib/channel/constants';
import { Instruction } from '@Lib/go/entity';
import { makeExecuteInstruction, makeParkCommand } from '@Lib/go';

export const WAIT_FOR_INCOMING_TAKE = 'WAIT_FOR_INCOMING_TAKE';
export function* waitForIncomingTakeGenerator<C extends Channel<any>>(
    ch: C,
): Generator<Instruction<unknown>> {
    if (ch.isClosed) {
        throw new Error(errorMessages.CHANNEL_CLOSED);
    }

    while (ch.takeBuffer.getSize() === 0) {
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        yield makeParkCommand();
    }
}

export function waitForIncomingTake<C extends Channel<any>>(
    ch: C,
): Instruction<Generator> {
    return makeExecuteInstruction(
        {
            name: WAIT_FOR_INCOMING_TAKE,
            function: waitForIncomingTakeGenerator,
        },
        [ch],
    );
}
