import { Command, Instruction } from '../entity';

export function makeParkCommand(): Instruction {
    return {
        command: Command.PARK,
    };
}
