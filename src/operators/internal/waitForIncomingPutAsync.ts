import { createAsyncWrapper } from '@Lib/shared';
import { waitForIncomingPut } from './waitForIncomingPut';

export const waitForIncomingPutAsync = createAsyncWrapper(waitForIncomingPut);
