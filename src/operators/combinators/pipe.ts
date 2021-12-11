import type { Channel } from '@Lib/channel';
import { createAsyncWrapper } from '@Lib/runner';
import { put } from '../core/put';
import { iterate } from '../collection/iterate';
import { close } from '@Lib/channel';

export function pipe<T = unknown>(
    destinationChannel: Channel<T>,
    sourceChannel: Channel<T>,
    keepOpen = false,
): { promise: Promise<void> } {
    const promise = (async () => {
        try {
            await createAsyncWrapper(iterate)(function* mapValues(data) {
                yield put(destinationChannel, data);
            }, sourceChannel);
        } finally {
            if (!keepOpen) {
                close(destinationChannel);
            }
        }
    })();

    return { promise };
}
