import { Events } from '../../entity';
import { isInstruction } from '../../utils';
import { isGenerator } from '../shared';
import { handleGeneratorYield } from './handleGeneratorYield';
import { handleInstructionYield } from './handleInstructionYield';
import { handlePromiseYield } from './handlePromiseYield';
import { NextStepConfig } from './nextStep.types';

export function nextStep<
    G extends Generator,
    TReturn,
    T,
    ItRes extends IteratorYieldResult<T | TReturn>,
>(config: NextStepConfig<G, ItRes, TReturn>): void {
    const {
        nextIteratorResult: { value: nextIteratorValue, done },
        iterator,
        isCancelledRef,
        successCallback,
        errorCallback,
    } = config;
    if (isCancelledRef.ref) {
        successCallback(Events.CANCELLED);
        return;
    }

    if (isGenerator(nextIteratorValue)) {
        handleGeneratorYield(config);
    } else if (done) {
        successCallback(nextIteratorValue as TReturn);
    } else {
        if (isInstruction(nextIteratorValue)) {
            handleInstructionYield(config);
            return;
        }
        if (nextIteratorValue instanceof Promise) {
            handlePromiseYield(config);
            return;
        }

        setTimeout(() => {
            nextStep({
                nextIteratorResult: iterator.next(
                    nextIteratorValue,
                ) as IteratorYieldResult<T | TReturn>,
                iterator,
                isCancelledRef,
                successCallback,
                errorCallback,
            });
        }, 0);
    }
}
