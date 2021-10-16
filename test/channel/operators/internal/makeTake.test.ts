import { makeChannel } from '@Lib/channel';
import { makeTake } from '@Lib/channel/operators/internal';

describe('makeTake', () => {
    it('should put an item to take queue', () => {
        const ch = makeChannel();
        makeTake(ch);
        expect(ch.takeBuffer.getSize()).toEqual(1);
    });
});
