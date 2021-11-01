import { Operator } from '@Lib/operators/operator.types';
import { Command } from '../entity';
import { isInstruction } from '../utils';

export interface CallInstruction<
    F extends (...args: any) => void = (...args: any) => void,
> {
    command: Command.CALL;
    function: F;
    name: string;
    args: readonly any[];
}

export function isCallInstruction(
    arg: any | CallInstruction,
): arg is CallInstruction {
    return arg && isInstruction(arg) && arg.command === Command.CALL;
}

export function makeCallInstruction<
    O extends (...a1: readonly any[]) => any,
    Params extends Parameters<O>,
>(
    operator: Operator<O>,
    args: Params,
): CallInstruction<Operator<O>['function']> {
    return {
        command: Command.CALL,
        function: operator.function,
        name: operator.name,
        args,
    };
}
