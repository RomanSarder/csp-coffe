import { makeChannel } from '@Lib/channel';
import { offerFn } from '@Lib/operators';

describe('offer', () => {
    it('should put value in channel and return true', () => {
        const ch = makeChannel();
        expect(offerFn(ch, 'test1')).toEqual(true);
        expect(ch.putBuffer.getElementsArray()).toEqual(['test1']);
    });

    describe('when the channel is closed', () => {
        const ch = makeChannel();
        ch.isClosed = true;
        expect(offerFn(ch, 'test1')).toEqual(null);
        expect(ch.putBuffer.getElementsArray()).toEqual([]);
    });
});
