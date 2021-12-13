import type { Buffer } from '@Lib/buffer';
import type { Multer as MulterInterface } from '@Lib/mult';
import { Multer, PutBuffer, TakeBuffer, Values } from './privateKeys';
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
    [Multer]: MulterInterface<T> | undefined;

    is: (ch: Channel<any>) => boolean;

    [Symbol.asyncIterator](): AsyncGenerator<T | string, string, unknown>;
};
