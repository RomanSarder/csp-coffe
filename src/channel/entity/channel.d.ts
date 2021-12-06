import type { Buffer } from '@Lib/buffer/entity/buffer';

export type Channel<T = NonNullable<any>> = {
    id: string;

    isBuffered: boolean;
    isClosed: boolean;

    capacity: number;

    putBuffer: Buffer<T>;
    takeBuffer: Buffer<null>;

    is: (ch: Channel<any>) => boolean;

    [Symbol.asyncIterator](): AsyncGenerator<T | string, string, unknown>;
};
