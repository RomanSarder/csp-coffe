import { createAsyncWrapper } from '@Lib/shared/utils/createAsyncWrapper';
import { put } from './put';

export const putAsync = createAsyncWrapper(put);
