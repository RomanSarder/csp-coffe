import { wrapIntoWorker } from '@Lib/go/worker/wrapIntoWorker/wrapIntoWorker';
import { putGenerator } from './put';

export const putAsync = wrapIntoWorker(putGenerator);
