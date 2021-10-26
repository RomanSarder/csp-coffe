import { Command } from './command';

export interface Instruction<T = unknown, A = unknown> {
    command: Command;
    meta?: {
        name: string;
        args: A;
    };
    value?: T;
}
