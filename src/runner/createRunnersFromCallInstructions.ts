import { markAsDebug, isGenerator } from '@Lib/shared/utils';
import type { CallInstruction } from '@Lib/instruction';
import { runIterator } from './runIterator';
import { cancelAll } from '@Lib/cancellablePromise';

export function* createRunnersFromCallInstructions(
    ...callInstructions: CallInstruction[]
) {
    const promises = [];
    try {
        for (const instruction of callInstructions) {
            yield markAsDebug(instruction);
            const instructionResult = instruction.function(...instruction.args);
            if (isGenerator(instructionResult)) {
                promises.push(runIterator(instructionResult));
            } else {
                promises.push(Promise.resolve(instructionResult));
            }
        }
        yield;
        return promises;
    } catch (e) {
        return cancelAll(promises);
    }
}
