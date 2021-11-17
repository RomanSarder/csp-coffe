// import { Channel } from '@Lib/channel';
// import { put } from './put';
// import { iterate } from './transformation';
// import { close } from './close';

// export function pipe<T = unknown>(
//     destinationChannel: Channel<T>,
//     sourceChannel: Channel<T>,
//     keepOpen = false,
// ): void {
//     iterate(async (data) => {
//         await put(destinationChannel, data);
//     }, sourceChannel).then(() => {
//         if (!keepOpen) {
//             close(destinationChannel);
//         }
//     });
// }

export function pipe() {
    return undefined;
}
