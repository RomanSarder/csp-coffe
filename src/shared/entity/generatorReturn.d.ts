export type GeneratorReturn<G> = G extends Generator<unknown, infer R, unknown>
    ? R
    : unknown;
