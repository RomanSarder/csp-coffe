import { CreatableBufferType } from '@Lib/buffer';
import { makeChannel } from '@Lib/channel/channel';
import { Channel } from '@Lib/channel/channel.types';
import { closeOnEmptyBuffer } from '@Lib/channel/proxy';
import { Flatten } from '@Lib/shared/types';
import { makePut } from '../internal/makePut';

export function fromArray<Arr extends any[]>(arr: Arr): Channel<Flatten<Arr>> {
    const ch = makeChannel<Flatten<Arr>>(CreatableBufferType.FIXED, arr.length);

    arr.forEach((element) => {
        makePut(ch, element);
    });

    return closeOnEmptyBuffer(ch);
}
