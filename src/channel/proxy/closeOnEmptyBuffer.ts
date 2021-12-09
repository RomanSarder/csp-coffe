import { close } from '@Lib/operators';
import { Channel } from '../entity/channel';
import { hasKey } from './utils/hasKey';

export function closeOnEmptyBuffer<C extends Channel<any>>(ch: C) {
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
