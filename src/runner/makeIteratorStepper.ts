import { isCancellablePromise } from '@Lib/cancellablePromise';
import { InstructionType, isInstruction } from '@Lib/go';
import { isGenerator } from '@Lib/shared/utils/isGenerator';
import { StepperVerb, StepResult } from './entity';
import { ChildrenIteratorsRunner } from './entity/childrenIteratorsRunner';
import { handleCancellablePromise, handleGenerator } from './utils';

export type Params = {
    iterator: Generator;
    verb: StepperVerb;
    state: { isCancelled: boolean };
    childrenIteratorsRunner: ChildrenIteratorsRunner;
    arg?: any;
};
/* TODO: Try me bitch */
export const makeIteratorStepper = ({
    iterator,
    state,
    childrenIteratorsRunner,
}: Pick<Params, 'iterator' | 'state' | 'childrenIteratorsRunner'>) => {
    return async (
        verb: Params['verb'],
        arg?: Params['arg'],
    ): Promise<StepResult> => {
        if (state.isCancelled) {
            return { value: undefined, done: true };
        }
        let result;

        try {
            result = iterator[verb](arg);
        } catch (e) {
            if (verb === 'throw') {
                return { error: e, done: true, value: undefined };
            }
            return { error: e, done: false, value: undefined };
        }

        let value;
        if (isCancellablePromise(result.value)) {
            return handleCancellablePromise({
                promise: result.value,
                childrenIteratorsRunner,
            });
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
                return handleGenerator({
                    childrenIteratorsRunner,
                    generator: instructionResult,
                    type: instruction.type as
                        | InstructionType.FORK
                        | InstructionType.SPAWN,
                });
            }
            value = instructionResult;
        }

        if (isGenerator(value)) {
            return handleGenerator({
                childrenIteratorsRunner,
                generator: value,
            });
        }

        if (result.done) {
            try {
                await childrenIteratorsRunner.waitForForks();
                return { value, done: true };
            } catch (e) {
                iterator.throw(e);
                return { value: undefined, error: e, done: true };
            }
        }
        return { value, done: false };
    };
};
