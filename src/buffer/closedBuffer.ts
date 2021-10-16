import { makeBufferWithCollection } from './makeBufferWithCollection';
import { makeDroppingQueue } from './collection';

export const makeClosedBuffer = <T = unknown>() => ({
    ...makeBufferWithCollection<T>(makeDroppingQueue<T>(0)),
    isBlocked() {
        return true;
    },
});
