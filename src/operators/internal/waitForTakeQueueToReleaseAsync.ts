import { wrapIntoWorker } from '@Lib/go/worker/wrapIntoWorker/wrapIntoWorker';
import { waitForTakeQueueToRelease } from './waitForTakeQueueToRelease';

export const waitForTakeQueueToReleaseAsync = wrapIntoWorker(
    waitForTakeQueueToRelease,
);
