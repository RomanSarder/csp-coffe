import { Instruction, InstructionType } from '../entity';
import { ScheduleInstruction } from '../entity/scheduleInstruction';
import { makeInstruction } from './makeInstruction';

export function isScheduleInstruction(
    callOrTask: Instruction,
): callOrTask is ScheduleInstruction {
    return callOrTask.command === InstructionType.SCHEDULE;
}

export function schedule<GenFn extends (...a1: readonly any[]) => Generator>(
    genFn: GenFn,
    ...args: Parameters<GenFn>
): ScheduleInstruction<GenFn> {
    return makeInstruction(
        InstructionType.SCHEDULE,
        genFn,
        ...args,
    ) as ScheduleInstruction<GenFn>;
}
