import { Channel } from '@Lib/channel';
import { put } from './put';
import { iterate } from '../iteration';
import { close } from '.';

export function pipe<T = unknown>(
    destinationChannel: Channel<T>,
    sourceChannel: Channel<T>,
    keepOpen = false,
): void {
    iterate(async (data) => {
        await put(destinationChannel, data);
    }, sourceChannel).then(() => {
        if (!keepOpen) {
            close(destinationChannel);
        }
    });
}
