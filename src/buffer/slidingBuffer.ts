import { makeBufferWithCollection } from './makeBufferWithCollection';
import { makeQueue } from './collection';
import { Buffer } from './buffer.types';

export const makeSlidingBuffer = <T = unknown>(capacity = 1): Buffer<T> => ({
    ...makeBufferWithCollection<T>(makeQueue<T>(capacity)),
});
