import { Operator } from '@Lib/operators/operator.types';
import { Command, Instruction } from '../entity';

export function makeExecuteInstruction<
    O extends (...a1: readonly any[]) => any,
    Params extends Parameters<O>,
>(operator: Operator<O>, args: Params): Instruction<ReturnType<O>> {
    return {
        command: Command.EXECUTE,
        value: operator.function(...args),
        meta: {
            name: operator.name,
            args,
        },
    };
}
