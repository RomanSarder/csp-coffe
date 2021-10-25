import { Command } from './command';

export interface Instruction<T = unknown> {
    command: Command;
    meta?: {
        name: string;
    };
    value?: T;
}
