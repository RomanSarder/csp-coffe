import { Collection } from './collection';

export type Buffer<T = unknown> = {
    collection: Collection<T>;
    add: (item: T) => void;
    release: () => T | undefined;
    getSize: () => number;
    isBlocked: () => boolean;
    getElementsArray: () => T[];
};
