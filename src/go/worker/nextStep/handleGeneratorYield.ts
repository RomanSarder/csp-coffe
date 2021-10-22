import { GeneratorReturn } from '@Lib/go/utils';
import { NextStepConfig } from './nextStep.types';
import { nextStep } from '.';
import { worker } from '../worker';

export function handleGeneratorYield<
    G extends Generator,
    ItRes extends IteratorResult<any, any>,
    TReturn = unknown,
>(config: NextStepConfig<G, ItRes, TReturn>) {
    const {
        nextIteratorResult: { value: nextIteratorValue },
        iterator,
        isCancelledRef,
        successCallback,
        errorCallback,
    } = config;

    setImmediate(() => {
        nextStep({
            nextIteratorResult: {
                done: false,
                // eslint-disable-next-line no-use-before-define
                value: worker(nextIteratorValue, isCancelledRef),
            } as unknown as IteratorYieldResult<GeneratorReturn<G> | TReturn>,
            iterator,
            isCancelledRef,
            successCallback,
            errorCallback,
        });
    });
}
