import type { Channel } from '@Lib/channel';
import { constant } from '@Lib/shared/utils';
import { Multer as MulterSymbol } from '@Lib/channel/entity/privateKeys';
import { MultedChannelCallback } from './entity/multedChannelCallback';

export function tap<T = any>(
    sourceChannel: Channel<T>,
    destinationChannel: Channel<any>,
    filter: (data: T) => boolean = constant(true),
) {
    if (!sourceChannel[MulterSymbol]) {
        throw new Error(
            'Cannot add tap to the channel without initialized multer',
        );
    } else {
        const multedChannelCallback = filter as MultedChannelCallback;
        multedChannelCallback.ch = destinationChannel;
        sourceChannel[MulterSymbol]?.multedChannelCallbacks.push(
            multedChannelCallback,
        );
    }
}
