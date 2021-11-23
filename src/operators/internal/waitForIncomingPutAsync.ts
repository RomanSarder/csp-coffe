import { createAsyncWrapper } from '@Lib/shared/utils';
import { waitForIncomingPut } from './waitForIncomingPut';

export const waitForIncomingPutAsync = createAsyncWrapper(waitForIncomingPut);
