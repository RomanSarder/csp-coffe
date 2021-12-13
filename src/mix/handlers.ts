import type { Channel } from '@Lib/channel';
import { put } from '@Lib/operators';
import type { MixedChannelData } from './entity/mixedChannelData';

export const makeNormalMixedChannelHandler = (ch: Channel<any>) => {
    return function* putToDestination(data: unknown) {
        yield put(ch, data);
    };
};

export function* mutedChannelHandler() {
    yield undefined;
}

export function makePausedMixedChannelData(): MixedChannelData {
    return {
        handler: mutedChannelHandler,
        cancellablePromise: undefined,
        option: 'pause',
    };
}
