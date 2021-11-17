import { makeChannel } from '@Lib/channel';
import {
    makePut,
    releasePut,
    waitUntilBufferEmpty,
} from '@Lib/operators/internal';
import { asyncGeneratorProxy } from '@Lib/asyncGeneratorProxy';
import { CreatableBufferType } from '@Lib/buffer';

describe('waitUntilBufferEmpty', () => {
    describe('when put buffer is not empty', () => {
        it('should complete only after put buffer becomes empty', async () => {
            const ch = makeChannel(CreatableBufferType.FIXED, 2);
            makePut(ch, 'test1');
            makePut(ch, 'test2');
            const iterator = asyncGeneratorProxy(waitUntilBufferEmpty(ch));
            expect((await iterator.next()).done).toEqual(false);
            releasePut(ch);
            expect((await iterator.next()).done).toEqual(false);
            releasePut(ch);
            expect((await iterator.next()).done).toEqual(true);
        });
    });

    describe('when put buffer is empty', () => {
        it('should complete immediately', async () => {
            const ch = makeChannel(CreatableBufferType.FIXED, 2);
            const iterator = asyncGeneratorProxy(waitUntilBufferEmpty(ch));
            expect((await iterator.next()).done).toEqual(true);
        });
    });
});
