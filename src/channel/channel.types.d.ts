import type { Buffer } from '@Lib/buffer';

export type Channel<T = unknown> = {
    isBuffered: boolean;
    isClosed: boolean;

    capacity: number;

    putBuffer: Buffer<T>;
    takeBuffer: Buffer<null>;

    [Symbol.asyncIterator](): AsyncGenerator<T | string, string, unknown>;
};
