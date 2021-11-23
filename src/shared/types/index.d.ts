export type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
