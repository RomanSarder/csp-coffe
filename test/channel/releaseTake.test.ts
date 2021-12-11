import { makeChannel, makeTakeRequest, releaseTake } from '@Lib/channel';
import { TakeBuffer } from '@Lib/channel/entity/privateKeys';

describe('releaseTake', () => {
    it('should remove an item from the take buffer', () => {
        const ch = makeChannel();
        makeTakeRequest(ch);
        releaseTake(ch);
        expect(ch[TakeBuffer].getSize()).toEqual(0);
    });
});
