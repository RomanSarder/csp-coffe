import { wrapIntoWorker } from '@Lib/go/worker/wrapIntoWorker/wrapIntoWorker';
import { waitForIncomingPutGenerator } from './waitForIncomingPut';

export const waitForIncomingPutAsync = wrapIntoWorker(
    waitForIncomingPutGenerator,
);
