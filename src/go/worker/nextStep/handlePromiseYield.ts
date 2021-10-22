import { NextStepConfig } from './nextStep.types';
import { nextStep } from '.';

export function handlePromiseYield<
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

    nextIteratorValue
        .then((result: unknown) => {
            nextStep({
                nextIteratorResult: { value: result, done: false },
                iterator,
                isCancelledRef,
                successCallback,
                errorCallback,
            });
        })
        .catch((e: unknown) => {
            errorCallback(e);
        });
}
