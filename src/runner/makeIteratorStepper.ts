import {
    CancellablePromise,
    isCancellablePromise,
} from '@Lib/cancellablePromise';
import type { Instruction } from '@Lib/instruction';
import { InstructionType, isInstruction } from '@Lib/instruction';
import { isGenerator, eventLoopQueue } from '@Lib/shared/utils';
import type { StepResult } from './entity/stepResult';
import type { StepperVerb } from './entity/stepperVerb';
import type { ChildrenIteratorsRunner } from './entity/childrenIteratorsRunner';
import { handleCancellablePromise } from './utils/handleCancellablePromise';
import { handleGenerator } from './utils/handleGenerator';

export type Params = {
    iterator: Generator;
    verb: StepperVerb;
    state: { isCancelled: boolean };
    childrenIteratorsRunner: ChildrenIteratorsRunner;
    onGenerator: (
        iterator: Generator,
        onInstruction?: ((instruction: Instruction) => void) | undefined,
    ) => CancellablePromise<any>;
    arg?: any;
    onInstruction?: (instruction: Instruction) => void;
};
export const makeIteratorStepper = ({
    iterator,
    state,
    childrenIteratorsRunner,
    onInstruction,
    onGenerator,
}: Pick<
    Params,
    | 'iterator'
    | 'state'
    | 'childrenIteratorsRunner'
    | 'onInstruction'
    | 'onGenerator'
>) => {
    return {
        step: async (
            verb: Params['verb'],
            arg?: Params['arg'],
        ): Promise<StepResult> => {
            if (state.isCancelled) {
                return { value: undefined, done: true };
            }
            let result;

            try {
                await eventLoopQueue();
                result = iterator[verb](arg);
            } catch (e) {
                if (verb === 'throw') {
                    return { error: e, done: true, value: undefined };
                }
                return { error: e, done: false, value: undefined };
            }

            let value;
            if (isInstruction(result.value)) {
                onInstruction?.(result.value);
            }

            if (isCancellablePromise(result.value)) {
                return handleCancellablePromise({
                    promise: result.value,
                    childrenIteratorsRunner,
                    done: result.done as boolean,
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
                        runIteratorPromise: onGenerator(
                            instructionResult,
                            onInstruction,
                        ),
                        type: instruction.type as
                            | InstructionType.FORK
                            | InstructionType.SPAWN,
                        done: result.done as boolean,
                    });
                }
                value = instructionResult;
            }

            if (isGenerator(value)) {
                return handleGenerator({
                    childrenIteratorsRunner,
                    runIteratorPromise: onGenerator(value, onInstruction),
                    done: result.done as boolean,
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
        },
    };
};
