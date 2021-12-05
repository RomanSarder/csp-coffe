import { Channel } from '@Lib/channel/channel.types';
import { createAsyncWrapper } from '@Lib/shared/utils/createAsyncWrapper';
import { put } from './put';
import { iterate } from './transformation';
import { close } from './close';

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
