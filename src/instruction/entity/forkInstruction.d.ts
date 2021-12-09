import { Instruction } from './instruction';
import { InstructionType } from './instructionType';

export type ForkInstruction<
    GenFn extends (...args: readonly any[]) => Generator = (
        ...args: readonly any[]
    ) => Generator,
> = Instruction<GenFn> & {
    type: InstructionType.FORK;
};
