import { Events } from '@Lib/go';
import { eventLoopQueue } from '@Lib/internal';

export function runAsyncGenerator(asyncIterator: AsyncGenerator) {
    return (async function run() {
        /* Provide an ability to cancel immediately */
        await eventLoopQueue();
        let nextIteratorResult = await asyncIterator.next();
        while (!nextIteratorResult.done) {
            const result = await asyncIterator.next(nextIteratorResult.value);

            if (result.value === Events.CANCELLED) {
                return result.value;
            }

            nextIteratorResult = result;
        }

        return nextIteratorResult.value;
    })();
}
