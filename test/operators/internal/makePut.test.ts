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

    describe("when the channel's buffer size is more than 1", () => {
        describe('when the buffer type is Dropping', () => {
            it('should not put a given value to queue', () => {
                const ch = makeChannel(BufferType.DROPPING, 2);
                makePut(ch, 'test1');
                makePut(ch, 'test2');
                makePut(ch, 'test3');
                expect(ch.putBuffer.getElementsArray()).toEqual([
                    'test1',
                    'test2',
                ]);
            });
        });

        describe('when the buffer type is Sliding', () => {
            it('should remove first item in queue and put the given value', () => {
                const ch = makeChannel(BufferType.SLIDING, 2);
                makePut(ch, 'test1');
                makePut(ch, 'test2');
                makePut(ch, 'test3');
                expect(ch.putBuffer.getElementsArray()).toEqual([
                    'test2',
                    'test3',
                ]);
            });
        });
    });
});
