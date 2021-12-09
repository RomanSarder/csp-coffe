import {
    InstructionType,
    ForkInstruction,
    makeInstruction,
} from '@Lib/instruction';

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
