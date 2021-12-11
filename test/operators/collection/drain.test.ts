import { makeChannel } from '@Lib/channel';
import { close, drain, makePutRequest } from '@Lib/operators';
import { delay } from '@Lib/shared/utils/delay';

describe('drain', () => {
    it('should return a promise which resolves with an array of channel values', async () => {
        const ch = makeChannel();
        const drainPromise = drain(ch);

        makePutRequest(ch, 1);
        await delay(200);
        makePutRequest(ch, 2);
        await delay(200);
        makePutRequest(ch, 3);
        await delay(500);
        close(ch);

        const result = await drainPromise;

        expect(result).toEqual([1, 2, 3]);
    });
});
