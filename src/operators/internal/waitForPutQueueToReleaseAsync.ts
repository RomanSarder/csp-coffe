import { createAsyncWrapper } from '@Lib/shared/utils';
import { waitForPutQueueToRelease } from './waitForPutQueueToRelease';

export const waitForPutQueueToReleaseAsync = createAsyncWrapper(
    waitForPutQueueToRelease,
);
