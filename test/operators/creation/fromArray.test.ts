import { eventLoopQueue } from '@Lib/shared/utils';
import { fromArray, takeAsync } from '@Lib/operators';

describe('fromArray', () => {
    it('should create channel containing values from array', async () => {
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
