import { eventLoopQueue } from '@Lib/internal';
import { fromArray } from '@Lib/operators/creation/fromArray';
import { takeAsync } from '@Lib/operators/takeAsync';

describe('fromArray', () => {
    it('should create channel with contents of array in buffer', async () => {
        const array = ['test1', 'test2'];
        const ch = fromArray(array);
        expect(await takeAsync(ch)).toEqual('test1');
        expect(await takeAsync(ch)).toEqual('test2');
        await eventLoopQueue();
    });

    it('should close channel once all values are taken', async () => {
        const array = ['test1', 'test2'];
        const ch = fromArray(array);
        expect(await takeAsync(ch)).toEqual('test1');
        expect(await takeAsync(ch)).toEqual('test2');
        await eventLoopQueue();
        expect(ch.isClosed).toEqual(true);
    });
});
