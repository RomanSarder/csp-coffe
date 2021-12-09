import type { Channel, ChannelConfiguration } from '@Lib/channel';

import {
    makeChannel,
    closeOnAllValuesTaken,
    DefaultChannelConfig,
} from '@Lib/channel';
import { putAsync } from '../core/putAsync';

type PromiseResponseType<PromiseType> = PromiseType extends Promise<
    NonNullable<infer T>
>
    ? T
    : any;

export function fromPromise<PromiseType extends Promise<NonNullable<any>>>(
    promise: PromiseType,
    { bufferType, capacity }: ChannelConfiguration = DefaultChannelConfig,
): Channel<PromiseResponseType<PromiseType>> {
    const ch = makeChannel<PromiseResponseType<PromiseType>>(
        bufferType,
        capacity,
    );

    promise.then((response) => {
        return putAsync(ch, response);
    });

    return closeOnAllValuesTaken(ch);
}
