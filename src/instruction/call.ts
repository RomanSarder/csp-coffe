import { InstructionType } from './entity/instructionType';
import { CallInstruction } from './entity/callInstruction';
import { makeInstruction } from './makeInstruction';

export function call<
    O extends (...a1: readonly any[]) => any,
    Params extends Parameters<O>,
>(fn: O, ...args: Params): CallInstruction {
    return makeInstruction(
        InstructionType.CALL,
        fn,
        ...args,
    ) as CallInstruction;
}
