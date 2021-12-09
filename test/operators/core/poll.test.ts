import { makeChannel } from '@Lib/channel';
import { pollFn } from '@Lib/operators/core/poll';
import { makePut } from '@Lib/operators/internal/makePut';

describe('poll', () => {
    describe('when there is value in channel', () => {
        it('should return value', () => {
            const ch = makeChannel();
            makePut(ch, 'test1');
            expect(pollFn(ch)).toEqual('test1');
        });
    });

    describe('when there is no value in channel', () => {
        it('should return null', () => {
            const ch = makeChannel();
            expect(pollFn(ch)).toEqual(null);
        });
    });

    describe('when channel is closed', () => {
        it('should return null', () => {
            const ch = makeChannel();
            ch.isClosed = true;
            expect(pollFn(ch)).toEqual(null);
        });
    });
});
