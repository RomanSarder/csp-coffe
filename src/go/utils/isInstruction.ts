import { InstructionType, Instruction } from '../entity';

export function isInstruction<T extends any>(
    data: any | T,
): data is Instruction {
    if (data && Object.values(InstructionType).includes(data.type)) {
        return true;
    }

    return false;
}
