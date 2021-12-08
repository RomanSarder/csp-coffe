export type GeneratorT<G> = G extends Generator<infer R, unknown, unknown>
    ? R
    : unknown;
