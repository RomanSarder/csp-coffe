import { Command } from './command';

export type Call<
    GenFn extends (...args: readonly any[]) => any = (
        ...args: readonly any[]
    ) => any,
> = {
    command: Command.CALL;
    function: GenFn;
    args: Parameters<GenFn>;
    name: string;
};
