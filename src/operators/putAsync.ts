import { createAsyncWrapper } from '@Lib/shared';
import { put } from './put';

export const putAsync = createAsyncWrapper(put);
