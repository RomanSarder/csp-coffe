import { CallInstruction } from '@Lib/go';
import { createRunner } from '@Lib/runner';
import { isGenerator } from './isGenerator';

export function createRunnersFromCallInstructions(
    ...callInstructions: CallInstruction[]
) {
    return callInstructions.map((instruction) => {
        const instructionResult = instruction.function(...instruction.args);

        if (isGenerator(instructionResult)) {
            return createRunner(instructionResult);
        }

        return Promise.resolve(instructionResult);
    });
}
