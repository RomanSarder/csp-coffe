import { isEqual } from 'lodash-es';
import { Instruction } from '@Lib/go';
import { asyncGeneratorProxy } from './asyncGeneratorProxy';

function createInstructionAsserter(instructions: Instruction[]) {
    return {
        call(fn: (...args: any[]) => any, ...args: any[]) {
            console.log('seeking for', fn.name, args);
            return instructions.some((instruction) => {
                console.log('checking', instruction.name, instruction.args);
                return (
                    instruction.name === fn.name &&
                    isEqual(instruction.args, args)
                );
            });
        },
    };
}
/* TODO: Accumulate all instructions for tests */
/* TODO: Create test generator runner which would conveniently provide assertions */
// eslint-disable-next-line consistent-return
export function testGeneratorRunner<G extends Generator>(iterator: G) {
    const emitedInstructions: Instruction[] = [];
    const iteratorProxy = asyncGeneratorProxy(iterator, emitedInstructions);

    return {
        iterator: iteratorProxy,
        createInstructionAsserter: () => {
            console.log(emitedInstructions);
            return createInstructionAsserter(emitedInstructions);
        },
        async runNTimes(times: number) {
            let counter = 1;
            let result = await iteratorProxy.next();
            while (counter < times && !result.done) {
                result = await iteratorProxy.next();
                counter += 1;
            }
            return result.value;
        },
        async runTillEnd() {
            let result = await iteratorProxy.next();

            while (!result.done) {
                result = await iteratorProxy.next();
            }

            return result.value;
        },
    };
}