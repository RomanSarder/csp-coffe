import {
    InstructionType,
    SpawnInstruction,
    makeInstruction,
} from '@Lib/instruction';

export function spawn<GenFn extends (...a1: readonly any[]) => Generator>(
    genFn: GenFn,
    ...args: Parameters<GenFn>
): SpawnInstruction<GenFn> {
    return makeInstruction(
        InstructionType.SPAWN,
        genFn,
        ...args,
    ) as SpawnInstruction<GenFn>;
}
