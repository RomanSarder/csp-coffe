import { wrapIntoWorker } from '@Lib/go/worker';
import { waitForIncomingTake } from './waitForIncomingTake';

export const waitForIncomingTakeAsync = wrapIntoWorker(waitForIncomingTake);
