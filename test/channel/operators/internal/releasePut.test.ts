import { makeChannel } from '@Lib/channel';
import { makePut, releasePut } from '@Lib/channel/operators/internal';

describe('releasePut', () => {
    it('should remove first item from the put queue and return it', () => {
        const ch = makeChannel();
        makePut(ch, 'test1');
        const result = releasePut(ch);
        expect(result).toEqual('test1');
        expect(ch.putBuffer.getSize()).toEqual(0);
    });
});
