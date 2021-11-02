import { wrapIntoWorker } from '@Lib/go/worker';
import { waitForTakeQueueToRelease } from './waitForTakeQueueToRelease';

export const waitForTakeQueueToReleaseAsync = wrapIntoWorker(
    waitForTakeQueueToRelease,
);
