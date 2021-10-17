import { Commands } from '../commands.constants';
import { Command } from '../commands.types';

export function isCommand(command: unknown): command is Command {
    if (command instanceof Array) {
        const commandType = command[0];

        if (Object.values(Commands).includes(commandType)) {
            return true;
        }
    }

    return false;
}
