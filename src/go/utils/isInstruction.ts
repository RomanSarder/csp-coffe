import { Command, Instruction } from '../entity';

export function isInstruction<T extends Instruction>(
    data: any | T,
): data is Instruction<T extends Instruction<infer U> ? U : any> {
    if (
        (data?.command && data?.command === Command.CONTINUE) ||
        data?.command === Command.PARK
    ) {
        return true;
    }

    return false;
}
