import { wrapIntoWorker } from '@Lib/go/worker';
import { take } from './take';

export const takeAsync = wrapIntoWorker(take);
