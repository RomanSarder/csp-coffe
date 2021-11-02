import { Command } from './command';

export type Task<
    GenFn extends (...args: readonly any[]) => any = (
        ...args: readonly any[]
    ) => any,
> = {
    command: Command.TASK;
    function: GenFn;
    args: Parameters<GenFn>;
    name: string;
    isFork: boolean;
};
