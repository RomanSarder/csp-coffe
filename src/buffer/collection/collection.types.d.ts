export type Collection<T = unknown> = {
    add(data: T): void;
    release(): void;
    getSize(): number;
    getCapacity(): number;
    getElementsArray(): T[];
};
