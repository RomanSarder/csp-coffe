import type { Instruction } from '@Lib/go';

export function markAsDebug(instruction: Instruction) {
    return {
        ...instruction,
        debug: true,
    };
}
