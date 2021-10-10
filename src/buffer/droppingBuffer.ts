import { makeBufferWithCollection } from './makeBufferWithCollection';
import { makeStack } from './collection';

export const makeDroppingBuffer = <T = unknown>(capacity = 1) =>
    makeBufferWithCollection<T>(makeStack<T>(capacity));
