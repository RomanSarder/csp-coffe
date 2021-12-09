import { createAsyncWrapper } from '@Lib/runner';
import { put } from './put';

export const putAsync = createAsyncWrapper(put);
