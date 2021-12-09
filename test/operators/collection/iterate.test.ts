import { CreatableBufferType } from '@Lib/buffer';
import { makeChannel, closeOnAllValuesTaken } from '@Lib/channel';
import { iterate, makePut } from '@Lib/operators';
import { runIterator } from '@Lib/runner';
import { constant } from 'lodash';

describe('iterate', () => {
    it('should call a callback with next channel value until channel closes', async () => {
        const spy = jest.fn();
        const ch = makeChannel(CreatableBufferType.UNBLOCKING);
        const ch2 = closeOnAllValuesTaken(ch);
        makePut(ch2, 'test1');
        makePut(ch2, 'test2');

        const runner = runIterator(iterate(spy, constant(true), ch2));

        await runner;

        expect(spy).toHaveBeenCalledWith('test1');
        expect(spy).toHaveBeenCalledWith('test2');
    });
});
