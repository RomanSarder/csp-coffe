export type GeneratorNext<G> = G extends Generator<unknown, unknown, infer R>
    ? R
    : unknown;
