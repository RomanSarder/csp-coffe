import { wrapIntoWorker } from '@Lib/go/worker/wrapIntoWorker/wrapIntoWorker';
import { put } from './put';

export const putAsync = wrapIntoWorker(put);
