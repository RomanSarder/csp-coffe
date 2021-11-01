import { wrapIntoWorker } from '@Lib/go/worker';
import { waitForIncomingPutGenerator } from './waitForIncomingPut';

export const waitForIncomingPutAsync = wrapIntoWorker(
    waitForIncomingPutGenerator,
);
