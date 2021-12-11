import { makeChannel, makeTakeRequest } from '@Lib/channel';
import { TakeBuffer } from '@Lib/channel/entity/privateKeys';

describe('makeTakeRequest', () => {
    it('should put a take request to take buffer', () => {
        const ch = makeChannel();
        makeTakeRequest(ch);
        expect(ch[TakeBuffer].getSize()).toEqual(1);
    });
});
