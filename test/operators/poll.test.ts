import { makeChannel } from '@Lib/channel';
import { poll } from '@Lib/operators';
import { makePut } from '@Lib/operators/internal';

describe('poll', () => {
    describe('when there is value in channel', () => {
        it('should return value', () => {
            const ch = makeChannel();
            makePut(ch, 'test1');
            expect(poll(ch)).toEqual('test1');
        });
    });

    describe('when there is no value in channel', () => {
        it('should return null', () => {
            const ch = makeChannel();
            expect(poll(ch)).toEqual(null);
        });
    });

    describe('when channel is closed', () => {
        it('should return null', () => {
            const ch = makeChannel();
            ch.isClosed = true;
            expect(poll(ch)).toEqual(null);
        });
    });
});
