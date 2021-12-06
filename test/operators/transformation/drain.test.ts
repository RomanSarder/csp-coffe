import { makeChannel } from '@Lib/channel/channel';
import { close } from '@Lib/operators/close';
import { makePut } from '@Lib/operators/internal/makePut';
import { drain } from '@Lib/operators/transformation/drain';
import { delay } from '@Lib/shared/utils/delay';

describe('drain', () => {
    describe('when the source channel is closed', () => {
        it('should return a promise which resolves with an array of channel values', async () => {
            const ch = makeChannel();
            const drainPromise = drain(ch);

            makePut(ch, 1);
            await delay(200);
            makePut(ch, 2);
            await delay(200);
            makePut(ch, 3);
            await delay(500);
            close(ch);

            const result = await drainPromise;

            expect(result).toEqual([1, 2, 3]);
        });
    });
});
