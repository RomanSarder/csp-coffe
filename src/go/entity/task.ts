import { Call } from './call';
import { Command } from './command';

export type Task<
    GenFn extends (...args: readonly any[]) => Generator = (
        ...args: readonly any[]
    ) => Generator,
> = Omit<Call<GenFn>, 'command'> & { command: Command.TASK; isFork: boolean };
