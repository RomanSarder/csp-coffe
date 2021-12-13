import type { Channel } from '@Lib/channel';
import { Multer as MulterSymbol } from '@Lib/channel/entity/privateKeys';
import type { Multer } from '@Lib/mult';

export async function untap<T = any>(
    sourceChannel: Channel<T>,
    destinationChannelId: string,
) {
    if (sourceChannel[MulterSymbol]) {
        (sourceChannel[MulterSymbol] as Multer<T>).multedChannelCallbacks = (
            sourceChannel[MulterSymbol] as Multer<T>
        ).multedChannelCallbacks.filter(
            (callback) => callback.ch.id !== destinationChannelId,
        );
    }
}
