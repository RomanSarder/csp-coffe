export type MaybeGeneratorReturnFromValue<G> = G extends Generator<
    any,
    infer U,
    any
>
    ? U
    : G;
