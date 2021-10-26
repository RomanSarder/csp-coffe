import { makeExecuteInstruction } from '@Lib/go';
import { Channel, FlattenChannel } from '../channel/channel.types';
import { isChannelClosedError } from '../channel/utils';
import {
    makePut,
    resetChannel,
    waitForIncomingTake,
    waitForPutQueueToRelease,
} from './internal';
import { Operator } from './operator.types';

export const PUT = 'PUT';

export function* putGenerator<C extends Channel<NonNullable<any>>>(
    ch: C,
    data: FlattenChannel<C>,
) {
    if (data === null) {
        throw new Error('null values are not allowed');
    }

    try {
        yield makeExecuteInstruction(waitForPutQueueToRelease, ch);
        makePut(ch, data);

        if (!ch.isBuffered) {
            yield makeExecuteInstruction(waitForIncomingTake, ch);
        }
    } catch (e) {
        if (!isChannelClosedError(e)) {
            throw e;
        }
        resetChannel(ch);
    }

    return true;
}

export function put<C extends Channel<any>>(
    ch: C,
    data: FlattenChannel<C>,
): Operator<Generator<unknown, boolean>> {
    return {
        name: PUT,
        generator: putGenerator(ch, data),
    };
}
