import { Command, Instruction } from '../entity';

export function isInstruction<T extends Instruction>(
    data: any | T,
): data is Instruction<T extends Instruction<infer U> ? U : any> {
    if (data && Object.values(Command).includes(data.command)) {
        return true;
    }

    return false;
}
