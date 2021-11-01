import { wrapIntoWorker } from '@Lib/go/worker';
import { putGenerator } from './put';

export const putAsync = wrapIntoWorker(putGenerator);
