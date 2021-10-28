export type Operator<F extends (...args: readonly any[]) => any> = {
    name: string;
    function: F;
};
