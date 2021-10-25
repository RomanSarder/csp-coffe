import { wrapIntoWorker } from '@Lib/go/worker/wrapIntoWorker/wrapIntoWorker';
import { waitForIncomingPut } from './waitForIncomingPut';

export const waitForIncomingPutAsync = wrapIntoWorker(waitForIncomingPut);
