import { createAsyncWrapper } from '@Lib/shared';
import { waitForPutQueueToRelease } from './waitForPutQueueToRelease';

export const waitForPutQueueToReleaseAsync = createAsyncWrapper(
    waitForPutQueueToRelease,
);
