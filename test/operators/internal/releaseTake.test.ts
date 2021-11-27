import { makeChannel } from '@Lib/channel/channel';
import { makeTake } from '@Lib/operators/internal/makeTake';
import { releaseTake } from '@Lib/operators/internal/releaseTake';

describe('releaseTake', () => {
    it('should remove first item from the take buffer', () => {
        const ch = makeChannel();
        makeTake(ch);
        releaseTake(ch);
        expect(ch.takeBuffer.getSize()).toEqual(0);
    });
});
