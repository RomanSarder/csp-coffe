import { Instruction } from './instruction';
import { InstructionType } from './instructionType';

export type CallInstruction<
    Fn extends (...args: readonly any[]) => any = (
        ...args: readonly any[]
    ) => any,
> = Instruction<Fn> & { type: InstructionType.CALL };
