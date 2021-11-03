import { Command } from '../entity';
import { Call } from '../entity/call';

export function call<
    O extends (...a1: readonly any[]) => any,
    Params extends Parameters<O>,
>(fn: O, ...args: Params): Call {
    return {
        command: Command.CALL,
        function: fn,
        name: fn.name,
        args,
    };
}
