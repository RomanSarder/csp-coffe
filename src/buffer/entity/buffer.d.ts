import type { BufferType } from './bufferType';
import type { Collection } from '../collection/entity/collection';

export type Buffer<T = unknown> = {
    type: BufferType;
    collection: Collection<T>;
    add: (item: T) => void;
    release: () => T | undefined;
    preview: () => T | undefined;
    getSize: () => number;
    isBlocked: () => boolean;
    getElementsArray: () => T[];
};
