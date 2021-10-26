import { wrapIntoWorker } from '@Lib/go/worker/wrapIntoWorker/wrapIntoWorker';
import { waitForIncomingTakeGenerator } from './waitForIncomingTake';

export const waitForIncomingTakeAsync = wrapIntoWorker(
    waitForIncomingTakeGenerator,
);
