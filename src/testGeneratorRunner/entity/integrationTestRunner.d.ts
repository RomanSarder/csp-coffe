import type { StepResult } from '@Lib/runner';
import type { InstructionAsserter } from './instructionAsserter';

export interface IntegrationGeneratorTestRunner {
    createInstructionAsserter: () => InstructionAsserter;
    next: (arg?: any) => Promise<StepResult>;
    runNTimes(times: number): Promise<StepResult>;
    runTillEnd(): Promise<StepResult>;
}
