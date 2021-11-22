import { Instruction } from '../entity';

export function markAsDebug(instruction: Instruction) {
    return {
        ...instruction,
        debug: true,
    };
}
