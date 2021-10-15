import { makeBufferWithCollection } from './makeBufferWithCollection';
import { makeDroppingQueue } from './collection';

export const makeDroppingBuffer = <T = unknown>(capacity = 1) =>
    makeBufferWithCollection<T>(makeDroppingQueue<T>(capacity));
