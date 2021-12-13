import { CreatableBufferType } from '@Lib/buffer';
import { close, makeChannel } from '@Lib/channel';
import { Values } from '@Lib/channel/entity/privateKeys';
import { attachMulter, tap } from '@Lib/mult';
import { putAsync, takeAsync } from '@Lib/operators';

describe('multer', () => {
    it('should distribute a copy of incoming channel value to multed channels in a sequential order', async () => {
        const spy = jest.fn();
        const sourceCh = makeChannel();
        const multedCh1 = makeChannel(
            CreatableBufferType.UNBLOCKING,
            1,
            'mult-1',
        );
        const multedCh2 = makeChannel(
            CreatableBufferType.UNBLOCKING,
            1,
            'mult-2',
        );
        attachMulter(sourceCh);
        tap(sourceCh, multedCh1);
        tap(sourceCh, multedCh2);

        await putAsync(sourceCh, 'test1');
        const takePromise1 = takeAsync(multedCh1).then((value) => {
            spy({
                value: value,
                chId: 'mult-1',
            });
        });
        const takePromise2 = takeAsync(multedCh2).then((value) => {
            spy({
                value,
                chId: 'mult-2',
            });
        });

        await Promise.all([takePromise1, takePromise2]);
        expect(spy.mock.calls[0][0]).toEqual({
            value: 'test1',
            chId: 'mult-1',
        });
        expect(spy.mock.calls[1][0]).toEqual({
            value: 'test1',
            chId: 'mult-2',
        });
        close(multedCh1);
        close(multedCh2);
        close(sourceCh);
    });

    it('should deliver a value to those channels which have their predicate returning true for the value', async () => {
        const sourceCh = makeChannel<number>();
        const multedCh1 = makeChannel(
            CreatableBufferType.UNBLOCKING,
            1,
            'mult-1',
        );
        const multedCh2 = makeChannel(
            CreatableBufferType.UNBLOCKING,
            1,
            'mult-2',
        );
        attachMulter(sourceCh);
        tap(sourceCh, multedCh1, (number) => number % 2 === 0);
        tap(sourceCh, multedCh2, (number) => number % 2 !== 0);
        await putAsync(sourceCh, 2);
        await putAsync(sourceCh, 3);
        expect(await takeAsync(multedCh1)).toEqual(2);
        expect(await takeAsync(multedCh2)).toEqual(3);
        expect(sourceCh[Values]).toEqual([]);
        expect(multedCh1[Values]).toEqual([]);
        expect(multedCh2[Values]).toEqual([]);
    });
});
