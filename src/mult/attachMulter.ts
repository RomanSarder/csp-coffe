/* create function makeMult which would augment a mult object into channel */
/* when adding a value to the channel with mult */
/* all multed channels should be pushed a value in parallel sequentially */
/* if mult tries to deliver value to closed channel - this channel is removed from mult */
/* should allow further extension with topics */
import type { Multer } from './entity/multer';
import type { Channel } from '@Lib/channel';
import { Multer as MulterSymbol } from '@Lib/channel/entity/privateKeys';
import { iterate } from '@Lib/operators';
import { runIterator } from '@Lib/runner';
import { deliverValueToMultedChannels } from './utils/deliverValueToMultedChannels';

export function attachMulter<T = any>(ch: Channel<T>) {
    const multer: Multer<T> = {
        sourceChannel: ch,
        multedChannelCallbacks: [],
        cancellablePromise: runIterator(
            (function* () {
                yield iterate(async function (value) {
                    await deliverValueToMultedChannels<T>(multer, value);
                }, ch);
            })(),
        ),
    };

    ch[MulterSymbol] = multer;
}
