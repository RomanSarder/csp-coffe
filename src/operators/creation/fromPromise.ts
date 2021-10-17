import { Channel, ChannelConfiguration, makeChannel } from '@Lib/channel';
import { DEFAULT_CHANNEL_CONFIG } from '@Lib/channel/constants';
import { close, put } from '..';

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

    promise
        .then((response) => {
            put(ch, response);
        })
        .finally(() => {
            close(ch);
        });

    return ch;
}
