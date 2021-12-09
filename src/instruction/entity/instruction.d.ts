import { InstructionType } from './instructionType';

export type Instruction<
    Fn extends (...args: readonly any[]) => any = (
        ...args: readonly any[]
    ) => any,
> = {
    type: InstructionType;
    function: Fn;
    args: Parameters<Fn>;
    name: string;
    debug: boolean;
    [key: string]: unknown;
};
