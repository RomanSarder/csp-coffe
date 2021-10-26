import { Operator } from '@Lib/operators/operator.types';
import { Command, Instruction } from '../entity';

export function makeExecuteInstruction<
    O extends (...a: readonly any[]) => Operator<Generator>,
>(makeOperator: O, ...args: Parameters<O>): Instruction<Generator> {
    const operator = makeOperator(...args);
    return {
        command: Command.EXECUTE,
        value: operator.generator,
        meta: {
            name: operator.name,
            args,
        },
    };
}
