import { makeChannel } from '@Lib/channel';
import { makePut, makeTake, resetChannel } from '@Lib/operators/internal';

describe('resetChannel', () => {
    it('should close the channel', () => {
        const ch = makeChannel();
        resetChannel(ch);
        expect(ch.isClosed).toEqual(true);
    });

    it('should create closed buffers', () => {
        const ch = makeChannel();
        resetChannel(ch);
        makePut(ch, 'test1');
        makeTake(ch);
        expect(ch.putBuffer.getElementsArray()).toEqual([]);
        expect(ch.takeBuffer.getElementsArray()).toEqual([]);
    });
});
