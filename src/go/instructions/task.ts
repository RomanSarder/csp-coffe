import { Command } from '../entity';
import { Call } from '../entity/call';
import { Task } from '../entity/task';
import { isCommand } from '../utils';

export function isCallOrTask(maybeTask: any | Task): maybeTask is Task | Call {
    return (
        isCommand(maybeTask) &&
        (maybeTask.command === Command.TASK ||
            maybeTask.command === Command.CALL)
    );
}

export function isTask(callOrTask: Call | Task): callOrTask is Task {
    return callOrTask.command === Command.TASK;
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
