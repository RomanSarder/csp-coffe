import { Command } from './command';

export interface Instruction<T = unknown> {
    command: Command;
    value?: T;
}
