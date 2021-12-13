import { Channel } from '@Lib/channel';
import { Multer as MulterSymbol } from '@Lib/channel/entity/privateKeys';

export function untap(
    sourceChannel: Channel<any>,
    destinationChannel: Channel<any>,
) {
    if (sourceChannel[MulterSymbol]) {
        sourceChannel[MulterSymbol]?.multedChannelCallbacks.filter(
            (callback) => callback.ch.id !== destinationChannel.id,
        );
    }
}
