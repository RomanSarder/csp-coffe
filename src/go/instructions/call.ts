import { InstructionType } from '../entity';
import { CallInstruction } from '../entity/callInstruction';

export function call<
    O extends (...a1: readonly any[]) => any,
    Params extends Parameters<O>,
>(fn: O, ...args: Params): CallInstruction {
    return {
        type: InstructionType.CALL,
        function: fn,
        name: fn.name,
        args,
    };
}
