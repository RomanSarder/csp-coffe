import { Command } from '@Lib/go/entity';
import { GeneratorReturn } from '@Lib/go/utils';
import { NextStepConfig } from './nextStep.types';
import { nextStep } from '.';
import { handleGeneratorYield } from './handleGeneratorYield';
import { worker } from '..';

export function handleInstructionYield<
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

    if (nextIteratorValue.command === Command.PARK) {
        setImmediate(() => {
            nextStep({
                nextIteratorResult: iterator.next() as IteratorYieldResult<
                    GeneratorReturn<G> | TReturn
                >,
                iterator,
                isCancelledRef,
                successCallback,
                errorCallback,
            });
        });
        return;
    }
    if (nextIteratorValue.command === Command.CONTINUE) {
        setImmediate(() => {
            nextStep({
                nextIteratorResult: iterator.next(
                    nextIteratorValue.value,
                ) as IteratorYieldResult<GeneratorReturn<G> | TReturn>,
                iterator,
                isCancelledRef,
                successCallback,
                errorCallback,
            });
        });
        return;
    }

    if (nextIteratorValue.command === Command.EXECUTE) {
        const nextIterator = nextIteratorValue.value;

        handleGeneratorYield({
            nextIteratorResult: iterator.next(
                // eslint-disable-next-line no-use-before-define
                worker(nextIterator, isCancelledRef),
            ) as IteratorYieldResult<GeneratorReturn<G> | TReturn>,
            iterator,
            isCancelledRef,
            successCallback,
            errorCallback,
        });
    }
}
