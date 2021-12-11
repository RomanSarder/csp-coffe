import type { Buffer } from '@Lib/buffer';
import { PutBuffer, TakeBuffer, Values } from './privateKeys';
import type { PutRequest } from './putRequest';
import type { TakeRequest } from './takeRequest';

export type Channel<T = NonNullable<any>> = {
    id: string;

    isBuffered: boolean;
    isClosed: boolean;

    capacity: number;

    [Values]: T[];
    [PutBuffer]: Buffer<PutRequest>;
    [TakeBuffer]: Buffer<TakeRequest>;

    is: (ch: Channel<any>) => boolean;

    [Symbol.asyncIterator](): AsyncGenerator<T | string, string, unknown>;
};
