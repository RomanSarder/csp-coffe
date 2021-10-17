import { BufferType } from '.';
import { Collection } from './collection';

export type Buffer<T = unknown> = {
    type: BufferType;
    collection: Collection<T>;
    add: (item: T) => void;
    release: () => T | undefined;
    getSize: () => number;
    isBlocked: () => boolean;
    getElementsArray: () => T[];
};

export type TypelessBuffer<T = unknown> = Omit<Buffer<T>, 'type'>;
