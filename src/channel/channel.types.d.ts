import type { Buffer } from '@Lib/buffer';
import { CreatableBufferType } from '@Lib/buffer';
import { Flatten } from '@Lib/shared';

export type Channel<T = unknown> = {
    id: string;

    isBuffered: boolean;
    isClosed: boolean;

    capacity: number;

    putBuffer: Buffer<T>;
    takeBuffer: Buffer<null>;

    is: (ch: Channel<any>) => boolean;

    // [Symbol.asyncIterator](): AsyncGenerator<T | string, string, unknown>;
};

export type ChannelConfiguration = {
    bufferType: CreatableBufferType;
    capacity?: number;
};

export type FlattenChannel<Type> = Type extends Channel<infer Item>
    ? Item
    : unknown;
export type FlattenChannels<Type> = FlattenChannel<Flatten<Type>>;
