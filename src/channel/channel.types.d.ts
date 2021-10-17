import type { Buffer } from '@Lib/buffer';
import { CreatableBufferTypes } from '@Lib/buffer';
import { Flatten } from '@Lib/shared';

export type Channel<T = unknown> = {
    isBuffered: boolean;
    isClosed: boolean;

    capacity: number;

    putBuffer: Buffer<T>;
    takeBuffer: Buffer<null>;

    [Symbol.asyncIterator](): AsyncGenerator<T | string, string, unknown>;
};

export type ChannelConfiguration = {
    bufferType: CreatableBufferTypes;
    capacity: number;
};

export type FlattenChannel<Type> = Type extends Channel<infer Item>
    ? Item
    : unknown;
export type FlattenChannels<Type> = FlattenChannel<Flatten<Type>>;
