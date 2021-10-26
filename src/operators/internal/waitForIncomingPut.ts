import { Channel } from '@Lib/channel';
import { errorMessages } from '@Lib/channel/constants';
import { Instruction } from '@Lib/go/entity';
import { makeParkCommand } from '@Lib/go';
import { Operator } from '../operator.types';

export const WAIT_FOR_INCOMING_PUT = 'WAIT_FOR_INCOMING_PUT';

export function* waitForIncomingPutGenerator<T = unknown>(
    ch: Channel<T>,
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
): Operator<Generator<Instruction>> {
    return {
        name: WAIT_FOR_INCOMING_PUT,
        generator: waitForIncomingPutGenerator(ch),
    };
}
