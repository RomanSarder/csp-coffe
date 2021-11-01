import { Command, Instruction } from '../entity';

export function makeContinueInstruction<T extends any>(): Instruction<T> {
    return {
        command: Command.CONTINUE,
    };
}
