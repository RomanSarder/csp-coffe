import { CancelledRef } from '../../entity';
import type { SuccessCallback, ErrorCallback } from '../worker.types';

export type NextStepConfig<
    G = Generator,
    ItRes = IteratorResult<any, any>,
    TReturn = unknown,
> = {
    nextIteratorResult: ItRes;
    iterator: G;
    isCancelledRef: CancelledRef;
    successCallback: SuccessCallback<TReturn>;
    errorCallback: ErrorCallback;
};
