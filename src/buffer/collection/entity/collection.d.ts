export type Collection<T = unknown> = {
    add(data: T): void;
    release(): T | undefined;
    getSize(): number;
    getCapacity(): number;
    getElementsArray(): T[];
};
