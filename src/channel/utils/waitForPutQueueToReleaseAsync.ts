import { createAsyncWrapper } from '@Lib/runner';
import { waitForPutQueueToRelease } from './waitForPutQueueToRelease';

export const waitForPutQueueToReleaseAsync = createAsyncWrapper(
    waitForPutQueueToRelease,
);
