import { wrapIntoWorker } from '@Lib/go/worker/wrapIntoWorker/wrapIntoWorker';
import { waitForIncomingTake } from './waitForIncomingTake';

export const waitForIncomingTakeAsync = wrapIntoWorker(waitForIncomingTake);
