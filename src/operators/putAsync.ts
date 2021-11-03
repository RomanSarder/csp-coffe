import { wrapIntoWorker } from '@Lib/go';
import { put } from './put';

export const putAsync = wrapIntoWorker(put);
