// import { Events, Instruction, isInstruction } from '@Lib/go';
import { Instruction, InstructionType, isInstruction } from '@Lib/go';
import { isGenerator } from '@Lib/shared/utils/isGenerator';

type UnitTestGeneratorRunner = {
    next: (arg?: any) => Promise<IteratorResult<any, any>>;
};

export function unitTestGeneratorRunner<G extends Generator>(
    iterator: G,
    instructionsList: Instruction[] = [],
): UnitTestGeneratorRunner {
    let nestedGenerator: UnitTestGeneratorRunner | undefined;
    let nextIteratorResult: IteratorResult<any, any>;

    async function next(arg: any): Promise<IteratorResult<any, any>> {
        try {
            if (nestedGenerator) {
                console.log('has nested generator');
                nextIteratorResult = await nestedGenerator.next(arg);
                console.log('nested generator result', nextIteratorResult);
                if (nextIteratorResult.done) {
                    nestedGenerator = undefined;
                    return { ...nextIteratorResult, done: false };
                }
                return nextIteratorResult;
            }
            console.log('calling next with', arg || nextIteratorResult?.value);
            nextIteratorResult = iterator.next(
                arg || nextIteratorResult?.value,
            );
            console.log('curr it result', nextIteratorResult);
            nextIteratorResult = {
                done: nextIteratorResult.done,
                value: await nextIteratorResult?.value,
            };

            if (isInstruction(nextIteratorResult.value)) {
                console.log('is instruction');
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
                console.log('setting nested generator');
                nestedGenerator = unitTestGeneratorRunner(
                    nextIteratorResult.value,
                    instructionsList,
                );

                nextIteratorResult = await nestedGenerator.next();
                console.log('first nested iterator yield', nextIteratorResult);
            }
        } catch (e) {
            nextIteratorResult = iterator.throw(e);
        }
        console.log('returning', nextIteratorResult);
        return nextIteratorResult;
    }

    return {
        next,
    };
}
