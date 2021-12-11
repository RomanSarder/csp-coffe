import {
    makeChannel,
    makePutRequest,
    makeTakeRequest,
    resetChannel,
} from '@Lib/channel';
import { PutBuffer, TakeBuffer } from '@Lib/channel/entity/privateKeys';

describe('resetChannel', () => {
    it('should close the channel', () => {
        const ch = makeChannel();
        resetChannel(ch);
        expect(ch.isClosed).toEqual(true);
    });

    it('should set buffer types to closed', () => {
        const ch = makeChannel();
        resetChannel(ch);
        makePutRequest(ch);
        makeTakeRequest(ch);
        expect(ch[PutBuffer].getElementsArray()).toEqual([]);
        expect(ch[TakeBuffer].getElementsArray()).toEqual([]);
    });
});
