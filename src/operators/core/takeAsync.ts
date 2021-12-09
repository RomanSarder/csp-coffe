import { createAsyncWrapper } from '@Lib/runner';
import { take } from './take';

export const takeAsync = createAsyncWrapper(take);
