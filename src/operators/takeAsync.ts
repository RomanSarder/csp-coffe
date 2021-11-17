import { createAsyncWrapper } from '@Lib/shared';
import { take } from './take';

export const takeAsync = createAsyncWrapper(take);
