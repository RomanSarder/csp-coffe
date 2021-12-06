import { Instruction } from '../entity/instruction';

export function markAsDebug(instruction: Instruction) {
    return {
        ...instruction,
        debug: true,
    };
}
