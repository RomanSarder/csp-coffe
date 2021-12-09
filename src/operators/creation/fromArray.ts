import { CreatableBufferType } from '@Lib/buffer';
import { makeChannel, closeOnEmptyBuffer } from '@Lib/channel';
import type { Channel } from '@Lib/channel';
import { Flatten } from '@Lib/shared/entity';
import { makePut } from '../internal/makePut';

export function fromArray<Arr extends any[]>(arr: Arr): Channel<Flatten<Arr>> {
    const ch = makeChannel<Flatten<Arr>>(CreatableBufferType.FIXED, arr.length);

    arr.forEach((element) => {
        makePut(ch, element);
    });

    return closeOnEmptyBuffer(ch);
}
