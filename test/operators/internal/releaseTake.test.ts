import { makeChannel } from '@Lib/channel';
import { makeTake, releaseTake } from '@Lib/operators/internal';

describe('releaseTake', () => {
    it('should remove first item from the take queue', () => {
        const ch = makeChannel();
        makeTake(ch);
        releaseTake(ch);
        expect(ch.takeBuffer.getSize()).toEqual(0);
    });
});
