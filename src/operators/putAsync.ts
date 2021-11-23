import { createAsyncWrapper } from '@Lib/shared/utils';
import { put } from './put';

export const putAsync = createAsyncWrapper(put);
