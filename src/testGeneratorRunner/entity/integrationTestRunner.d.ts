import { StepResult } from '@Lib/runner/entity';
import { InstructionAsserter } from './instructionAsserter';

export interface IntegrationGeneratorTestRunner {
    createInstructionAsserter: () => InstructionAsserter;
    next: (arg?: any) => Promise<StepResult>;
    runNTimes(times: number): Promise<StepResult>;
    runTillEnd(): Promise<StepResult>;
}
