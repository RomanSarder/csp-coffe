import { makeChannel } from '@Lib/channel';
import { makeTake, releaseTake } from '@Lib/operators';

describe('releaseTake', () => {
    it('should remove an item from the take buffer', () => {
        const ch = makeChannel();
        makeTake(ch);
        releaseTake(ch);
        expect(ch.takeBuffer.getSize()).toEqual(0);
    });
});
