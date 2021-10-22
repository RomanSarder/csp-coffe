import { Command, Instruction } from '../entity';

export function makeParkCommand(): Instruction {
    return {
        command: Command.PARK,
    };
}

export function makeContinueInstruction<T>(val: T): Instruction<T> {
    return {
        command: Command.CONTINUE,
        value: val,
    };
}
