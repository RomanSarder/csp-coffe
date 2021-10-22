import { Channel } from '@Lib/channel';
import { go } from '..';
import { CancelledRef } from '../entity';
import { Commands } from './commands.constants';

export type ForkCommand = [
    Commands.FORK,
    (r: CancelledRef) => { promise: Promise<any>; channel: Channel<any> },
];

export function fork<G extends Generator<unknown, unknown, unknown>>(
    generator: () => G,
): ForkCommand {
    return [Commands.FORK, (r: CancelledRef) => go(generator, r)];
}
