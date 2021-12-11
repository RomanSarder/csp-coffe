import { makeChannel, close, isChannelClosed } from '@Lib/channel';

describe('close', () => {
    it('should close the channel', () => {
        const ch = makeChannel();
        close(ch);
        expect(isChannelClosed(ch)).toEqual(true);
    });
});
