import type { Channel } from '@Lib/channel';
import { put } from '@Lib/operators';

export const makeNormalMixedChannelHandler = (ch: Channel<any>) => {
    return function* putToDestination(data: unknown) {
        yield put(ch, data);
    };
};

export function* mutedChannelHandler() {
    yield undefined;
}
