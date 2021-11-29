export type InstructionAsserter = {
    call(fn: (...args: any[]) => any, ...args: any[]): boolean;
};
