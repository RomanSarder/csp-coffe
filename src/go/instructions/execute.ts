import { Operator } from '@Lib/operators/operator.types';
import { Command } from '../entity';
import { isInstruction } from '../utils';

export interface ExecuteInstruction<G extends Generator = Generator> {
    command: Command.EXECUTE;
    generator: G;
    name: string;
    args: readonly any[];
}

export function isExecuteInstruction(
    arg: any | ExecuteInstruction<Generator>,
): arg is ExecuteInstruction<Generator> {
    return arg && isInstruction(arg) && arg.command === Command.EXECUTE;
}

export function makeExecuteInstruction<
    O extends (...a1: readonly any[]) => any,
    Params extends Parameters<O>,
>(operator: Operator<O>, args: Params): ExecuteInstruction<ReturnType<O>> {
    return {
        command: Command.EXECUTE,
        generator: operator.function(...args),
        name: operator.name,
        args,
    };
}
