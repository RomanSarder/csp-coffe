import { Command } from '../entity';
import { Task } from '../entity/task';

export function call<
    O extends (...a1: readonly any[]) => any,
    Params extends Parameters<O>,
>(fn: O, ...args: Params): Task {
    return {
        command: Command.TASK,
        function: fn,
        name: fn.name,
        args,
        isFork: false,
    };
}
