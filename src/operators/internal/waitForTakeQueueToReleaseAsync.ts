import { wrapIntoWorker } from '@Lib/go/worker/wrapIntoWorker/wrapIntoWorker';
import { waitForTakeQueueToReleaseGenerator } from './waitForTakeQueueToRelease';

export const waitForTakeQueueToReleaseAsync = wrapIntoWorker(
    waitForTakeQueueToReleaseGenerator,
);
