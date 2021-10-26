import { wrapIntoWorker } from '@Lib/go/worker/wrapIntoWorker/wrapIntoWorker';
import { waitForPutQueueToReleaseGenerator } from './waitForPutQueueToRelease';

export const waitForPutQueueToReleaseAsync = wrapIntoWorker(
    waitForPutQueueToReleaseGenerator,
);
