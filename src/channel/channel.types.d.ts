import type { Buffer } from '@Lib/buffer';

export type Channel<T = unknown> = {
    putBuffer: Buffer<T>;
    takeBuffer: Buffer<null>;
};
