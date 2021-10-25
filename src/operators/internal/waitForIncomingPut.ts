import { Channel } from '@Lib/channel';
import { errorMessages } from '@Lib/channel/constants';
import { Instruction } from '@Lib/go/entity';
import { makeParkCommand } from '@Lib/go/utils';

export function* waitForIncomingPut<T = unknown>(
    ch: Channel<T>,
): Generator<Instruction> {
    console.log('is closed');
    if (ch.isClosed) {
        throw new Error(errorMessages.CHANNEL_CLOSED);
    }

    while (ch.putBuffer.getSize() === 0) {
        console.log('inside while');
        if (ch.isClosed) {
            throw new Error(errorMessages.CHANNEL_CLOSED);
        }
        console.log('park');
        yield makeParkCommand();
    }
}
