import type { Buffer } from '@Lib/buffer';

export type Channel<T = unknown> = {
    isBuffered: boolean;
    isClosed: boolean;

    capacity: number;

    putBuffer: Buffer<T>;
    takeBuffer: Buffer<null>;

    [Symbol.asyncIterator](): AsyncGenerator<T | string, string, unknown>;
};

export type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
export type FlattenChannel<Type> = Type extends Channel<infer Item>
    ? Item
    : unknown;
export type FlattenChannels<Type> = FlattenChannel<Flatten<Type>>;
