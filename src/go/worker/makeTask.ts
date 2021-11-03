import { Task } from '../entity/task';

export function makeTask(generator: Generator, isFork = false): Task {
    return { generator, isFork };
}
