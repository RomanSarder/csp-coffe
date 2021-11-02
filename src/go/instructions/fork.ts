import { Task } from '../entity/task';
import { makeTaskCommand } from './task';

export function fork<GenFn extends (...a1: readonly any[]) => Generator>(
    genFn: GenFn,
    ...args: Parameters<GenFn>
): Task<GenFn> {
    return makeTaskCommand(genFn, true, args);
}
