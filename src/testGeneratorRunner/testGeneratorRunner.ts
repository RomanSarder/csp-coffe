import { isEqual } from 'lodash-es';
import { Instruction } from '@Lib/go';
import { asyncGeneratorProxy } from './asyncGeneratorProxy';

function createInstructionAsserter(instructions: Instruction[]) {
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

/* TODO: use upcoming stepper function for integration tests */
// eslint-disable-next-line consistent-return
export function testGeneratorRunner<G extends Generator>(iterator: G) {
    const emitedInstructions: Instruction[] = [];
    const iteratorProxy = asyncGeneratorProxy(iterator, emitedInstructions);

    return {
        iterator: iteratorProxy,
        createInstructionAsserter: () => {
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
