import { createAsyncWrapper } from '@Lib/shared/utils/createAsyncWrapper';
import { waitUntilBufferEmpty } from './waitUntilBufferEmpty';

export const waitUntilBufferIsEmptyAsync =
    createAsyncWrapper(waitUntilBufferEmpty);
