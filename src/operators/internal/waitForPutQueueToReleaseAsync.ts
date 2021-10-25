import { wrapIntoWorker } from '@Lib/go/worker/wrapIntoWorker/wrapIntoWorker';
import { waitForPutQueueToRelease } from './waitForPutQueueToRelease';

export const waitForPutQueueToReleaseAsync = wrapIntoWorker(
    waitForPutQueueToRelease,
);
