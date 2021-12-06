import type { Buffer } from '@Lib/buffer/entity/buffer';
import { CreatableBufferType } from '@Lib/buffer/entity/bufferType';
import { Flatten } from '@Lib/shared/types';

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

export type ChannelConfiguration = {
    bufferType: CreatableBufferType;
    capacity?: number;
};

export type FlattenChannel<Type> = Type extends Channel<infer Item>
    ? Item
    : unknown;
export type FlattenChannels<Type> = FlattenChannel<Flatten<Type>>;
