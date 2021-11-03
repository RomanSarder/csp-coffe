import { Instruction } from './instruction';
import { InstructionType } from './instructionType';

export type ScheduleInstruction<
    GenFn extends (...args: readonly any[]) => Generator = (
        ...args: readonly any[]
    ) => Generator,
> = Instruction<GenFn> & {
    type: InstructionType.SCHEDULE;
};
