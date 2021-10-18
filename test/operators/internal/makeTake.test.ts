import { makeChannel } from '@Lib/channel';
import { makeTake } from '@Lib/operators/internal';

describe('makeTake', () => {
    it('should put an item to take buffer', () => {
        const ch = makeChannel();
        makeTake(ch);
        expect(ch.takeBuffer.getSize()).toEqual(1);
    });
});
