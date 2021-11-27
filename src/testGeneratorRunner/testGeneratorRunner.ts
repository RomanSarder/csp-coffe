import { isEqual } from 'lodash-es';
import { Instruction } from '@Lib/go';
import { makeChildrenIteratorsRunner } from '@Lib/runner/makeChildrenIteratorsRunner';
import { makeIteratorStepper } from '@Lib/runner/makeIteratorStepper';
import { StepResult } from '@Lib/runner/entity';

function createInstructionAsserter(instructions: Instruction[]) {
    return {
        call(fn: (...args: any[]) => any, ...args: any[]) {
            return instructions.some((instruction) => {
                return (
                    instruction.name === fn.name &&
                    isEqual(instruction.args, args)
                );
            });
        },
    };
}

/* TODO: use upcoming stepper function for integration tests */
// eslint-disable-next-line consistent-return
export function testGeneratorRunner<G extends Generator>(iterator: G) {
    const emitedInstructions: Instruction[] = [];
    const childrenIteratorsRunner = makeChildrenIteratorsRunner();
    const { step } = makeIteratorStepper({
        iterator,
        childrenIteratorsRunner,
        state: { isCancelled: false },
        onInstruction: (instruction) => {
            emitedInstructions.push(instruction);
        },
    });
    let lastStepResult: StepResult;

    const next = async (arg?: any) => {
        lastStepResult = await step('next', arg || lastStepResult?.value);
        return lastStepResult;
    };

    return {
        createInstructionAsserter: () => {
            return createInstructionAsserter(emitedInstructions);
        },
        next,
        async runNTimes(times: number) {
            let counter = 1;
            if (!lastStepResult) {
                lastStepResult = await next();
            }
            while (counter < times && !lastStepResult.done) {
                lastStepResult = await next();
                counter += 1;
            }
            return lastStepResult;
        },
        async runTillEnd() {
            if (!lastStepResult) {
                lastStepResult = await next();
            }

            while (!lastStepResult.done) {
                lastStepResult = await next();
            }

            return lastStepResult;
        },
    };
}
