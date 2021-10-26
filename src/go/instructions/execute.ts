import { Operator } from '@Lib/operators/operator.types';
import { Command, Instruction } from '../entity';

export function makeExecuteInstruction<
    O extends Operator<any>,
    G = O extends Operator<infer T> ? T : unknown,
>(operator: O): Instruction<G> {
    return {
        command: Command.EXECUTE,
        value: operator.generator,
        meta: {
            name: operator.name,
        },
    };
}
