import { wrapIntoWorker } from '@Lib/go/worker';
import { waitForIncomingPut } from './waitForIncomingPut';

export const waitForIncomingPutAsync = wrapIntoWorker(waitForIncomingPut);
