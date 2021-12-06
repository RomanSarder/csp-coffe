import { createAsyncWrapper } from '@Lib/shared/utils/createAsyncWrapper';
import { waitForPutQueueToRelease } from './waitForPutQueueToRelease';

export const waitForPutQueueToReleaseAsync = createAsyncWrapper(
    waitForPutQueueToRelease,
);
