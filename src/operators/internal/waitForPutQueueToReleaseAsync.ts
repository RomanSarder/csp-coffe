import { wrapIntoWorker } from '@Lib/go/worker';
import { waitForPutQueueToReleaseGenerator } from './waitForPutQueueToRelease';

export const waitForPutQueueToReleaseAsync = wrapIntoWorker(
    waitForPutQueueToReleaseGenerator,
);
