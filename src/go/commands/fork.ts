import { Channel } from '@Lib/channel';
import { go } from '..';
import { Commands } from './commands.constants';

export type ForkCommand = [
    Commands.FORK,
    { promise: Promise<any>; channel: Channel<any> },
];

export function fork<G extends Generator<unknown, unknown, unknown>>(
    generator: () => G,
): ForkCommand {
    return [Commands.FORK, go(generator)];
}
