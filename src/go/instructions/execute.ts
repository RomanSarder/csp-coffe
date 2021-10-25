import { Command, Instruction } from '../entity';

export function makeExecuteInstruction<T extends Generator>(
    name: string,
    val: T,
): Instruction<T> {
    return {
        command: Command.EXECUTE,
        value: val,
        meta: {
            name,
        },
    };
}
