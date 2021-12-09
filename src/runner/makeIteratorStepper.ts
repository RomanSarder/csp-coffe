import { isCancellablePromise } from '@Lib/cancellablePromise';
import type { Instruction } from '@Lib/instruction';
import { InstructionType, isInstruction } from '@Lib/instruction';
import { isGenerator } from '@Lib/shared/utils/isGenerator';
import { eventLoopQueue } from '@Lib/internal';
import { runIterator } from './runIterator';
import { StepperVerb, StepResult } from './entity';
import { ChildrenIteratorsRunner } from './entity/childrenIteratorsRunner';
import { handleCancellablePromise, handleGenerator } from './utils';

export type Params = {
    iterator: Generator;
    verb: StepperVerb;
    state: { isCancelled: boolean };
    childrenIteratorsRunner: ChildrenIteratorsRunner;
    arg?: any;
    onInstruction?: (instruction: Instruction) => void;
};
export const makeIteratorStepper = ({
    iterator,
    state,
    childrenIteratorsRunner,
    onInstruction,
}: Pick<
    Params,
    'iterator' | 'state' | 'childrenIteratorsRunner' | 'onInstruction'
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
                        runIteratorPromise: runIterator(
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
                    runIteratorPromise: runIterator(value, onInstruction),
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
