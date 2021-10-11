import { Collection } from './collection';

export type Buffer<T = unknown> = {
    collection: Collection<T>;
    add: (item: T) => void;
    release: () => void;
    getSize: () => number;
    getElementsArray: () => T[];
};