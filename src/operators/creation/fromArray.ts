import { BufferType } from '@Lib/buffer';
import { makeChannel } from '@Lib/channel';
import { Flatten } from '@Lib/channel/channel.types';
import { close } from '..';
import { makePut } from '../internal';

const hasKey = <T extends Record<string, any>>(
    obj: T,
    k: keyof any,
): k is keyof T => k in obj;

export function fromArray<Arr extends any[]>(arr: Arr) {
    const ch = makeChannel<Flatten<Arr>>(BufferType.FIXED, arr.length);

    arr.forEach((element) => {
        makePut(ch, element);
    });

    return new Proxy(ch, {
        get(target, name, receiver) {
            if (name === 'isClosed') {
                if (target.putBuffer.getSize() === 0) {
                    close(target);
                    return true;
                }
            }
            return hasKey(ch, name)
                ? Reflect.get(target, name, receiver)
                : undefined;
        },
    });
}
