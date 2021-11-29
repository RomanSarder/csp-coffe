export interface UnitTestGeneratorRunner {
    next: (arg?: any) => Promise<IteratorResult<any, any>>;
}
