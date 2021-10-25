import { Command, Instruction } from '../entity';

export function makeContinueInstruction<T extends any>(
    val?: T,
): Instruction<T> {
    return {
        command: Command.CONTINUE,
        value: val,
    };
}
