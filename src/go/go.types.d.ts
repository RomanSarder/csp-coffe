import { Command } from './entity';

export interface Instruction<T = unknown> {
    command: Command;
    value?: T;
}
