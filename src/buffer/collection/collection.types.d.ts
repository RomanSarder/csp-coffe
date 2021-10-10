export type Collection<T = unknown> = {
    add(data: T): void;
    release(): void;
    getSize(): number;
    getElementsArray(): T[];
};
