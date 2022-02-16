import { makeChannel, close } from '@Lib/channel';
import { drain, putAsync } from '@Lib/operators';

describe('drain', () => {
    it('should return a promise which resolves with an array of channel values', async () => {
        const ch = makeChannel();
        const drainPromise = drain(ch);

        await putAsync(ch, 1);
        await putAsync(ch, 2);
        await putAsync(ch, 3);
        close(ch);

        const result = await drainPromise;

        expect(result).toEqual([1, 2, 3]);
    });
});
