import { wrapIntoWorker } from '@Lib/go/worker';
import { takeGenerator } from './take';

export const takeAsync = wrapIntoWorker(takeGenerator);
