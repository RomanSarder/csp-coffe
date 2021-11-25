import {
    CancellablePromise,
    isCancellablePromise,
} from '@Lib/cancellablePromise';
import { createCancellablePromise } from '@Lib/cancellablePromise/createCancellablePromise';
import { InstructionType, isInstruction } from '@Lib/go';
import { isGenerator } from '@Lib/shared/utils/isGenerator';
import { isCancelError } from '../cancellablePromise/cancelError';
import { StepperVerb } from './entity';
import { makeChildrenIteratorsRunner } from './makeChildrenIteratorsRunner';
import { handleCancellablePromise } from './utils';
import { handleGenerator } from './utils/handleGenerator';

export const runIterator = (iterator: Generator): CancellablePromise<any> => {
    const state = {
        isCancelled: false,
    };

    const {
        resolve: resolveStepper,
        reject: rejectStepper,
        cancellablePromise: stepperPromise,
    } = createCancellablePromise();
    const childrenIteratorsRunner = makeChildrenIteratorsRunner();

    const { resolve, reject, cancellablePromise } = createCancellablePromise(
        async (reason) => {
            state.isCancelled = true;
            try {
                await childrenIteratorsRunner.cancelOngoing();
            } finally {
                await childrenIteratorsRunner.cancelForks();
            }
            try {
                iterator.throw(reason);
            } catch (e) {
                // In case generator does not have try/catch block
                // Swallow error on purpose
                if (!isCancelError(e)) {
                    throw e;
                }
            } finally {
                await stepperPromise;
            }
        },
    );

    childrenIteratorsRunner.setCancelHandler(cancellablePromise.cancel);

    const step = async (verb: StepperVerb, arg?: any): Promise<any> => {
        if (state.isCancelled) {
            return undefined;
        }
        try {
            let result;

            try {
                result = iterator[verb](arg);
            } catch (e) {
                if (verb === 'throw') {
                    reject(e);
                    return resolveStepper(undefined);
                }
                throw e;
            }
            let value;
            if (isCancellablePromise(result.value)) {
                const nextStepperArgs = await handleCancellablePromise({
                    promise: result.value,
                    childrenIteratorsRunner,
                });
                return step(...nextStepperArgs);
            }
            value = await result.value;
            await result.value;

            if (value instanceof Error) {
                throw value;
            }

            if (isInstruction(value) && !value.debug) {
                const instruction = value;
                const instructionResult = await instruction.function(
                    ...instruction.args,
                );

                if (isGenerator(instructionResult)) {
                    const nextStepperArgs = await handleGenerator({
                        childrenIteratorsRunner,
                        subRunner: runIterator(instructionResult),
                        type: instruction.type as
                            | InstructionType.FORK
                            | InstructionType.SPAWN,
                    });
                    return step(...nextStepperArgs);
                }
                value = instructionResult;
            }

            if (isGenerator(value)) {
                const nextStepperArgs = await handleGenerator({
                    childrenIteratorsRunner,
                    subRunner: runIterator(value),
                });
                return step(...nextStepperArgs);
            }

            if (result.done) {
                try {
                    await childrenIteratorsRunner.waitForForks();
                    resolve(value);
                } catch (e) {
                    iterator.throw(e);
                    reject(e);
                }
                return undefined;
            }
            return step('next', value);
        } catch (err) {
            return step('throw', err);
        }
    };

    step('next').then(resolveStepper, rejectStepper);

    return cancellablePromise;
};
