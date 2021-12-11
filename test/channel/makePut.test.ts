import { makeChannel, makePutRequest } from '@Lib/channel';
import { putRequest } from '@Lib/channel/config';
import { PutBuffer } from '@Lib/channel/entity/privateKeys';

describe('makePutRequest', () => {
    it('should put a put request into a put buffer', () => {
        const ch = makeChannel();
        makePutRequest(ch);
        expect(ch[PutBuffer].getElementsArray()[0]).toEqual(putRequest);
    });
});
