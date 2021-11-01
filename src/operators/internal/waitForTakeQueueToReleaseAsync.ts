import { wrapIntoWorker } from '@Lib/go/worker';
import { waitForTakeQueueToReleaseGenerator } from './waitForTakeQueueToRelease';

export const waitForTakeQueueToReleaseAsync = wrapIntoWorker(
    waitForTakeQueueToReleaseGenerator,
);
