import { Command } from './constants';

export interface Instruction<T = unknown> {
    command: Command;
    value?: T;
}

export type CancelledRef = { ref: boolean };
export type GenT<G> = G extends Generator<infer R, unknown, unknown>
    ? R
    : unknown;
export type GenReturn<G> = G extends Generator<unknown, infer R, unknown>
    ? R
    : unknown;
export type GenNext<G> = G extends Generator<unknown, unknown, infer R>
    ? R
    : unknown;
