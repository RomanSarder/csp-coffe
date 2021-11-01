import { wrapIntoWorker } from '@Lib/go/worker';
import { waitForIncomingTakeGenerator } from './waitForIncomingTake';

export const waitForIncomingTakeAsync = wrapIntoWorker(
    waitForIncomingTakeGenerator,
);
