import { createAsyncWrapper } from '@Lib/shared/utils/createAsyncWrapper';
import { waitForIncomingPut } from './waitForIncomingPut';

export const waitForIncomingPutAsync = createAsyncWrapper(waitForIncomingPut);
