import { CallInstruction, markAsDebug } from '@Lib/go';
import { createRunner } from '@Lib/runner';
import { isGenerator } from './isGenerator';

export function* createRunnersFromCallInstructions(
    ...callInstructions: CallInstruction[]
) {
    const promises = [];

    for (const instruction of callInstructions) {
        yield markAsDebug(instruction);
        promises.push(
            (async () => {
                const instructionResult = instruction.function(
                    ...instruction.args,
                );

                if (isGenerator(instructionResult)) {
                    return createRunner(instructionResult);
                }

                return Promise.resolve(instructionResult);
            })(),
        );
    }

    return promises;
}
