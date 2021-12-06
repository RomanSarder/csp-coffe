import { createAsyncWrapper } from '@Lib/shared/utils/createAsyncWrapper';
import { take } from './take';

export const takeAsync = createAsyncWrapper(take);
