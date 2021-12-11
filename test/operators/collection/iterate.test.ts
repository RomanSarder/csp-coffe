import { CreatableBufferType } from '@Lib/buffer';
import { makeChannel, closeOnAllValuesTaken } from '@Lib/channel';
import { iterate, makePutRequest } from '@Lib/operators';
import { runIterator } from '@Lib/runner';

describe('iterate', () => {
    it('should call a callback with next channel value until channel closes', async () => {
        const spy = jest.fn();
        const ch = makeChannel(CreatableBufferType.UNBLOCKING);
        const ch2 = closeOnAllValuesTaken(ch);
        makePutRequest(ch2, 'test1');
        makePutRequest(ch2, 'test2');

        const runner = runIterator(iterate(spy, ch2));

        await runner;

        expect(spy).toHaveBeenCalledWith('test1');
        expect(spy).toHaveBeenCalledWith('test2');
    });
});
