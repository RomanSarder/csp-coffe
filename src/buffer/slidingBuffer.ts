import { makeBufferWithCollection } from './makeBufferWithCollection';
import { makeQueue } from './collection';

export const makeSlidingBuffer = <T = unknown>(capacity = 1) =>
    makeBufferWithCollection<T>(makeQueue<T>(capacity));
