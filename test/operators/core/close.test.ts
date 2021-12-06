import { makeChannel } from '@Lib/channel/channel';
import { close } from '@Lib/operators/core/close';

describe('close', () => {
    it('should close the channel', () => {
        const ch = makeChannel();
        close(ch);
        expect(ch.isClosed).toEqual(true);
    });
});
