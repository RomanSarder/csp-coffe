import { CreatableBufferType } from '@Lib/buffer';
import { makeChannel, Channel } from '@Lib/channel';
import { closeOnEmptyBuffer } from '@Lib/channel/proxy';
import { Flatten } from '@Lib/shared';
import { makePut } from '../internal';

export function fromArray<Arr extends any[]>(arr: Arr): Channel<Flatten<Arr>> {
    const ch = makeChannel<Flatten<Arr>>(CreatableBufferType.FIXED, arr.length);

    arr.forEach((element) => {
        makePut(ch, element);
    });

    return closeOnEmptyBuffer(ch);
}
