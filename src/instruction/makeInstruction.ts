import { InstructionType } from './entity/instructionType';
import { Instruction } from './entity/instruction';

export function makeInstruction<
    O extends (...a1: readonly any[]) => any,
    Params extends Parameters<O>,
>(instructionType: InstructionType, fn: O, ...args: Params): Instruction {
    return {
        type: instructionType,
        function: fn,
        name: fn.name,
        args,
        debug: false,
    };
}
