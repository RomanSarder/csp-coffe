export type Operator<G extends Generator> = {
    name: string;
    generator: G;
};
