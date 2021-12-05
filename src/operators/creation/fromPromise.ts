import { Channel, ChannelConfiguration } from '@Lib/channel/channel.types';
import { makeChannel } from '@Lib/channel/channel';
import { DEFAULT_CHANNEL_CONFIG } from '@Lib/channel/constants';
import { closeOnAllValuesTaken } from '@Lib/channel/proxy';
import { putAsync } from '../putAsync';

type PromiseResponseType<PromiseType> = PromiseType extends Promise<
    NonNullable<infer T>
>
    ? T
    : any;

export function fromPromise<PromiseType extends Promise<NonNullable<any>>>(
    promise: PromiseType,
    { bufferType, capacity }: ChannelConfiguration = DEFAULT_CHANNEL_CONFIG,
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
