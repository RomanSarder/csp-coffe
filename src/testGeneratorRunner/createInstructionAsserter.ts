import { Instruction } from '@Lib/go/entity/instruction';
import { isEqual } from 'lodash-es';

export function createInstructionAsserter(instructions: Instruction[]) {
    return {
        call(fn: (...args: any[]) => any, ...args: any[]) {
            return instructions.some((instruction) => {
                return (
                    instruction.name === fn.name &&
                    isEqual(instruction.args, args)
                );
            });
        },
    };
}
