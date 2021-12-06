import { InstructionType } from '@Lib/go/entity/instructionType';
import { Instruction } from '@Lib/go/entity/instruction';
import { isInstruction } from '@Lib/go/utils/isInstruction';
import { isGenerator } from '@Lib/shared/utils/isGenerator';
import { UnitTestGeneratorRunner } from './entity';

export function unitTestGeneratorRunner<G extends Generator>(
    iterator: G,
    instructionsList: Instruction[] = [],
): UnitTestGeneratorRunner {
    let nestedGenerator: UnitTestGeneratorRunner | undefined;
    let nextIteratorResult: IteratorResult<any, any>;

    async function next(arg: any): Promise<IteratorResult<any, any>> {
        try {
            if (nestedGenerator) {
                nextIteratorResult = await nestedGenerator.next(arg);
                if (nextIteratorResult.done) {
                    nestedGenerator = undefined;
                    return { ...nextIteratorResult, done: false };
                }
                return nextIteratorResult;
            }
            nextIteratorResult = iterator.next(
                arg || nextIteratorResult?.value,
            );
            nextIteratorResult = {
                done: nextIteratorResult.done,
                value: await nextIteratorResult?.value,
            };

            if (isInstruction(nextIteratorResult.value)) {
                instructionsList.push(nextIteratorResult.value);

                if (nextIteratorResult.value.type === InstructionType.CALL) {
                    nextIteratorResult = {
                        ...nextIteratorResult,
                        value: nextIteratorResult.value.function(
                            ...nextIteratorResult.value.args,
                        ),
                    };
                }
            }

            if (isGenerator(nextIteratorResult.value)) {
                nestedGenerator = unitTestGeneratorRunner(
                    nextIteratorResult.value,
                    instructionsList,
                );

                nextIteratorResult = await nestedGenerator.next();

                nextIteratorResult = {
                    value: await nextIteratorResult.value,
                    done: false,
                };
            }
        } catch (e) {
            nextIteratorResult = iterator.throw(e);
        }
        return nextIteratorResult;
    }

    return {
        next,
    };
}
