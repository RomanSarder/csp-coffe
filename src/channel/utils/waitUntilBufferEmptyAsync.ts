import { createAsyncWrapper } from '@Lib/runner';
import { waitUntilBufferEmpty } from './waitUntilBufferEmpty';

export const waitUntilBufferIsEmptyAsync =
    createAsyncWrapper(waitUntilBufferEmpty);
