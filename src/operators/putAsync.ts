import { wrapIntoWorker } from '@Lib/go/worker';
import { put } from './put';

export const putAsync = wrapIntoWorker(put);
