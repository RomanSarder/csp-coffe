import { Command } from '../entity';
import { Task } from '../entity/task';
import { isInstruction } from '../utils';

export function isTask(maybeTask: any | Task): maybeTask is Task {
    return isInstruction(maybeTask) && maybeTask.command === Command.TASK;
}

export function makeTaskCommand<GenFn extends (...a1: readonly any[]) => any>(
    genFn: GenFn,
    isFork = false,
    args: Parameters<GenFn>,
): Task<GenFn> {
    return {
        command: Command.TASK,
        function: genFn,
        name: genFn.name,
        args,
        isFork,
    };
}
