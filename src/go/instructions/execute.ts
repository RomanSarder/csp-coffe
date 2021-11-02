import { Task } from '../entity/task';
import { makeTaskCommand } from './task';

export function execute<GenFn extends (...a1: readonly any[]) => Generator>(
    genFn: GenFn,
    ...args: Parameters<GenFn>
): Task<GenFn> {
    return makeTaskCommand(genFn, false, args);
}
