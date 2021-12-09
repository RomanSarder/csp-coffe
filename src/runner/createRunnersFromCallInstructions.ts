import { markAsDebug } from '../shared/utils/markAsDebug';
import type { CallInstruction } from '@Lib/go';
import { runIterator } from './runIterator';
import { isGenerator } from '@Lib/shared/utils';

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
