import { Channel } from '@Lib/channel';
import { errorMessages } from '@Lib/channel/constants';
import { Instruction } from '@Lib/go/entity';
import { makeParkCommand } from '@Lib/go';
import { Operator } from '../operator.types';

export const WAIT_FOR_INCOMING_TAKE = 'WAIT_FOR_INCOMING_TAKE';
export function* waitForIncomingTakeGenerator<T = unknown>(
    ch: Channel<T>,
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

export function waitForIncomingTake<T = unknown>(
    ch: Channel<T>,
): Operator<Generator<Instruction<unknown>>> {
    return {
        name: WAIT_FOR_INCOMING_TAKE,
        generator: waitForIncomingTakeGenerator(ch),
    };
}
