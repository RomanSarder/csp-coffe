import type { Buffer } from '@Lib/buffer';

export type Channel<T = unknown> = {
    isBuffered: boolean;
    putBuffer: Buffer<T>;
    takeBuffer: Buffer<null>;
};
