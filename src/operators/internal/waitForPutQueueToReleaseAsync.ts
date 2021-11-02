import { wrapIntoWorker } from '@Lib/go/worker';
import { waitForPutQueueToRelease } from './waitForPutQueueToRelease';

export const waitForPutQueueToReleaseAsync = wrapIntoWorker(
    waitForPutQueueToRelease,
);
