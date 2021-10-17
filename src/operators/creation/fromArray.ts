import { BufferType } from '@Lib/buffer';
import { makeChannel, Channel } from '@Lib/channel';
import { closeOnEmptyBufferProxy } from '@Lib/channel/proxy/closeOnEmptyBufferProxy';
import { Flatten } from '@Lib/shared';
import { makePut } from '../internal';

export function fromArray<Arr extends any[]>(arr: Arr): Channel<Flatten<Arr>> {
    const ch = makeChannel<Flatten<Arr>>(BufferType.FIXED, arr.length);

    arr.forEach((element) => {
        makePut(ch, element);
    });

    return closeOnEmptyBufferProxy(ch);
}
