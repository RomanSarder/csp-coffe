import { createAsyncWrapper } from '@Lib/runner';
import { waitForIncomingPut } from './waitForIncomingPut';

export const waitForIncomingPutAsync = createAsyncWrapper(waitForIncomingPut);
