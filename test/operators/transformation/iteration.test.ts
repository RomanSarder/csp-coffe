import { CreatableBufferType } from '@Lib/buffer';
import { Events, makeChannel } from '@Lib/channel';
import { asyncGeneratorProxy } from '@Lib/go/worker';
import { close, newIterate } from '@Lib/operators';
import { makePut } from '@Lib/operators/internal';

describe('iterate', () => {
    it('should call a callback with values in channel until it closes', () => {
        const ch = makeChannel(CreatableBufferType.UNBLOCKING);
        const spy = jest.fn();
        makePut(ch, 'test1');
        makePut(ch, 'test2');
        const iterator = asyncGeneratorProxy(newIterate(spy, ch));
        iterator.next();
        iterator.next();
        expect(spy).toHaveBeenCalledWith('test1');
        iterator.next();
        iterator.next();
        expect(spy).toHaveBeenCalledWith('test2');
        close(ch);
        iterator.next();
        expect(spy).toHaveBeenCalledWith(Events.CHANNEL_CLOSED);
    });
});
