import { Instruction } from '@Lib/go/go.types';
import { Command } from '../constants';

export function isInstruction(data: any | Instruction): data is Instruction {
    if (
        (data?.command && data?.command === Command.CONTINUE) ||
        data?.command === Command.PARK
    ) {
        return true;
    }

    return false;
}
