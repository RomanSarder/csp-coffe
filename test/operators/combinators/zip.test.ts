import { makeChannel } from '@Lib/channel/channel';
import { Events } from '@Lib/channel/constants';
import { close } from '@Lib/operators/close';
import { zip } from '@Lib/operators/combinators';
import { makePut } from '@Lib/operators/internal/makePut';
import { delay } from '@Lib/shared/utils/delay';

describe('zip', () => {
    describe('when given a list of channels and a callback', () => {
        it('should invoke a callback once every channel emitted', async () => {
            const spy = jest.fn();
            const ch1 = makeChannel();
            const ch2 = makeChannel();

            zip(spy, ch1, ch2);

            makePut(ch1, 'test1');
            await delay(100);
            expect(spy).not.toHaveBeenCalled();
            makePut(ch2, 'test2');
            await delay(100);
            expect(spy.mock.calls[0][0]).toEqual(['test1', 'test2']);
            close(ch1);
            makePut(ch2, 'another2');
            await delay(100);
            expect(spy.mock.calls[1][0]).toEqual([
                Events.CHANNEL_CLOSED,
                'another2',
            ]);
            close(ch2);
        });
    });
});
