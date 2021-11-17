import { createAsyncWrapper } from '@Lib/shared';
import { waitUntilBufferEmpty } from './waitUntilBufferEmpty';

export const waitUntilBufferIsEmptyAsync =
    createAsyncWrapper(waitUntilBufferEmpty);
