import { BufferType } from '@Lib/buffer';
import { makeChannel } from '@Lib/channel';
import { makePut } from '@Lib/operators/internal';

describe('makePut', () => {
    it('should put a given value to put queue', () => {
        const ch = makeChannel();
        makePut(ch, 'test1');
        expect(ch.putBuffer.getElementsArray()[0]).toEqual('test1');
    });

    it('should throw when trying to put null', () => {
        const ch = makeChannel();
        expect(() => {
            makePut(ch, null);
        }).toThrowError('null values are not allowed');
    });
});
