import { makeBufferWithCollection } from './makeBufferWithCollection';
import { makeDroppingQueue } from './collection';
import { Buffer } from './buffer.types';

export const makeDroppingBuffer = <T = unknown>(capacity = 1): Buffer<T> => ({
    ...makeBufferWithCollection<T>(makeDroppingQueue<T>(capacity)),
});
