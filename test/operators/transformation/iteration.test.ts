import { CreatableBufferType } from '@Lib/buffer';
import { Events, makeChannel } from '@Lib/channel';
import { asyncGeneratorProxy } from '@Lib/go/worker';
import { close, newIterate } from '@Lib/operators';
import { makePut } from '@Lib/operators/internal';

describe('iterate', () => {
    it('should call a callback with values in channel until it closes', async () => {
        const ch = makeChannel(CreatableBufferType.UNBLOCKING);
        const spy = jest.fn();
        makePut(ch, 'test1');
        makePut(ch, 'test2');
        const iterator = asyncGeneratorProxy(newIterate(spy, ch));
        const result1 = await iterator.next();
        const result2 = await iterator.next(result1);
        expect(spy).toHaveBeenCalledWith('test1');
        const result3 = await iterator.next(result2);
        const result4 = await iterator.next(result3);
        expect(spy).toHaveBeenCalledWith('test2');
        close(ch);
        await iterator.next(result4);
        expect(spy).toHaveBeenCalledWith(Events.CHANNEL_CLOSED);
    });
});
