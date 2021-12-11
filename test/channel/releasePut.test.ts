import { makeChannel, makePutRequest, releasePut } from '@Lib/channel';
import { PutBuffer } from '@Lib/channel/entity/privateKeys';

describe('releasePut', () => {
    it('should remove first put request from put buffer', () => {
        const ch = makeChannel();
        makePutRequest(ch);
        releasePut(ch);
        expect(ch[PutBuffer].getElementsArray()).toEqual([]);
    });
});
