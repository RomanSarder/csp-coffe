import { CreatableBufferType } from '@Lib/buffer';
import { makeChannel } from '@Lib/channel';
import { iterate } from '@Lib/operators';
import { makePut } from '@Lib/operators/internal';
import { closeOnAllValuesTaken } from '@Lib/channel/proxy';
import { createRunner } from '@Lib/runner';

describe('iterate', () => {
    it('should call a callback with values in channel until it closes', async () => {
        const spy = jest.fn();
        const ch = makeChannel(CreatableBufferType.UNBLOCKING);
        const ch2 = closeOnAllValuesTaken(ch);
        makePut(ch2, 'test1');
        makePut(ch2, 'test2');

        const runner = createRunner(iterate(spy, ch2));

        await runner;

        expect(spy).toHaveBeenCalledWith('test1');
        expect(spy).toHaveBeenCalledWith('test2');
    });
});
