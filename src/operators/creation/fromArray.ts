import { CreatableBufferType } from '@Lib/buffer';
import {
    makeChannel,
    closeOnEmptyBuffer,
    makePutRequest,
    push,
} from '@Lib/channel';
import type { Channel } from '@Lib/channel';
import { Flatten } from '@Lib/shared/entity';

export function fromArray<Arr extends any[]>(arr: Arr): Channel<Flatten<Arr>> {
    const ch = makeChannel<Flatten<Arr>>(CreatableBufferType.FIXED, arr.length);

    arr.forEach((element) => {
        makePutRequest(ch);
        push(ch, element);
    });

    return closeOnEmptyBuffer(ch);
}
