import { makeChannel, Events, close, makePutRequest, push } from '@Lib/channel';
import { zip } from '@Lib/operators';
import { delay } from '@Lib/shared/utils';

describe('zip', () => {
    describe('when given a list of channels and a callback', () => {
        it('should invoke a callback once every channel emitted', async () => {
            const spy = jest.fn();
            const ch1 = makeChannel();
            const ch2 = makeChannel();

            zip(spy, ch1, ch2);

            makePutRequest(ch1);
            push(ch1, 'test1');
            await delay(100);
            expect(spy).not.toHaveBeenCalled();
            makePutRequest(ch2);
            push(ch2, 'test2');
            await delay(100);
            expect(spy.mock.calls[0][0]).toEqual(['test1', 'test2']);
            close(ch1);
            makePutRequest(ch2);
            push(ch2, 'another2');
            await delay(100);
            expect(spy.mock.calls[1][0]).toEqual([
                Events.CHANNEL_CLOSED,
                'another2',
            ]);
            close(ch2);
        });
    });
});
