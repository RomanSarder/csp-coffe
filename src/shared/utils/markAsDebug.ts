import type { Instruction } from '@Lib/instruction';

export function markAsDebug(instruction: Instruction) {
    return {
        ...instruction,
        debug: true,
    };
}
