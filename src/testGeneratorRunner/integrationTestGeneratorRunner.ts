import type { Instruction } from '@Lib/instruction';
import { makeChildrenIteratorsRunner } from '@Lib/runner/makeChildrenIteratorsRunner';
import { makeIteratorStepper, runIterator } from '@Lib/runner';
import type { StepResult } from '@Lib/runner/entity';
import { createInstructionAsserter } from './createInstructionAsserter';
import { IntegrationGeneratorTestRunner } from './entity';

// eslint-disable-next-line consistent-return
export function integrationTestGeneratorRunner<G extends Generator>(
    iterator: G,
): IntegrationGeneratorTestRunner {
    const emitedInstructions: Instruction[] = [];
    const childrenIteratorsRunner = makeChildrenIteratorsRunner();
    const { step } = makeIteratorStepper({
        iterator,
        childrenIteratorsRunner,
        state: { isCancelled: false },
        onGenerator: runIterator,
        onInstruction: (instruction) => {
            emitedInstructions.push(instruction);
        },
    });
    let lastStepResult: StepResult;

    const next = async (arg?: any) => {
        lastStepResult = lastStepResult?.error
            ? await step('throw', arg || lastStepResult?.error)
            : await step('next', arg || lastStepResult?.value);
        return lastStepResult;
    };

    return {
        createInstructionAsserter: () => {
            return createInstructionAsserter(emitedInstructions);
        },
        next,
        async runNTimes(times: number) {
            let counter = 1;
            while (counter < times && !lastStepResult.done) {
                lastStepResult = await next();
                counter += 1;
            }
            return lastStepResult;
        },
        async runTillEnd() {
            if (!lastStepResult) {
                await next();
            }

            while (!lastStepResult.done) {
                await next();
            }
            return lastStepResult;
        },
    };
}
