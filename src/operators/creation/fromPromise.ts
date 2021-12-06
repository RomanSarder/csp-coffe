import { ChannelConfiguration } from '@Lib/channel/entity/channelConfiguration';
import { Channel } from '@Lib/channel/entity/channel';
import { makeChannel } from '@Lib/channel/channel';
import { DEFAULT_CHANNEL_CONFIG } from '@Lib/channel/config';
import { closeOnAllValuesTaken } from '@Lib/channel/proxy/closeOnAllValuesTaken';
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
