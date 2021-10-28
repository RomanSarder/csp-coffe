import { wrapIntoWorker } from '@Lib/go/worker/wrapIntoWorker/wrapIntoWorker';
import { takeGenerator } from './take';

export const takeAsync = wrapIntoWorker(takeGenerator);
