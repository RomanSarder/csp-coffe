import { markAsDebug, isGenerator } from '@Lib/shared/utils';
import type { CallInstruction } from '@Lib/go';
import { runIterator } from './runIterator';

export function* createRunnersFromCallInstructions(
    ...callInstructions: CallInstruction[]
) {
    const promises = [];

    for (const instruction of callInstructions) {
        yield markAsDebug(instruction);
        const instructionResult = instruction.function(...instruction.args);
        if (isGenerator(instructionResult)) {
            promises.push(runIterator(instructionResult));
        } else {
            promises.push(Promise.resolve(instructionResult));
        }
    }

    return promises;
}
