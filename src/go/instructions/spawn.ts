import { InstructionType, ForkInstruction } from '../entity';
import { makeInstruction } from './makeInstruction';

export function spawn<GenFn extends (...a1: readonly any[]) => Generator>(
    genFn: GenFn,
    ...args: Parameters<GenFn>
): ForkInstruction<GenFn> {
    return makeInstruction(
        InstructionType.SPAWN,
        genFn,
        ...args,
    ) as ForkInstruction<GenFn>;
}
