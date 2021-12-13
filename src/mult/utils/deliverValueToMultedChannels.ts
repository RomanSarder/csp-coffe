import { putAsync } from '@Lib/operators';
import type { Multer } from '../entity/multer';

export async function deliverValueToMultedChannels<T = any>(
    multer: Multer<T>,
    value: T,
) {
    await multer.multedChannelCallbacks.reduce(
        async (accPromise, nextMultedChannelCallback) => {
            await accPromise;
            if (nextMultedChannelCallback(value)) {
                await putAsync(nextMultedChannelCallback.ch, value);
            }
            return await Promise.resolve();
        },
        Promise.resolve(),
    );
}
