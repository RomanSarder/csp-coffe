import { makeBufferWithCollection } from './makeBufferWithCollection';
import { makeQueue } from './collection';

export const makeClosedBuffer = <T = unknown>() =>
    makeBufferWithCollection<T>(makeQueue<T>(0));
