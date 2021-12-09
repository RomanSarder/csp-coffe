import { InstructionType } from './entity/instructionType';
import { ForkInstruction } from './entity/forkInstruction';
import { makeInstruction } from './makeInstruction';

export function fork<GenFn extends (...a1: readonly any[]) => Generator>(
    genFn: GenFn,
    ...args: Parameters<GenFn>
): ForkInstruction<GenFn> {
    return makeInstruction(
        InstructionType.FORK,
        genFn,
        ...args,
    ) as ForkInstruction<GenFn>;
}
