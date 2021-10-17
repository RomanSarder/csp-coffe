import { close } from '@Lib/operators';
import { Channel } from '../channel.types';

const hasKey = <T extends Record<string, any>>(
    obj: T,
    k: keyof any,
): k is keyof T => k in obj;

export function closeOnEmptyBufferProxy<C extends Channel<any>>(ch: C) {
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
