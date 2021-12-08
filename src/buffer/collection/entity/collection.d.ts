export type Collection<T = unknown> = {
    add(data: T): void;
    preview(): T | undefined;
    release(): T | undefined;
    getSize(): number;
    getCapacity(): number;
    getElementsArray(): T[];
};
