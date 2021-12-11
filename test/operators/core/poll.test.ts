import { close, makeChannel, push, makePutRequest } from '@Lib/channel';
import { PutBuffer, Values } from '@Lib/channel/entity/privateKeys';
import { poll } from '@Lib/operators';
import { integrationTestGeneratorRunner } from '@Lib/testGeneratorRunner';

describe('poll', () => {
    describe('when there is value in channel', () => {
        it('should return value and release put request', async () => {
            const ch = makeChannel();
            const { next } = integrationTestGeneratorRunner(poll(ch));
            makePutRequest(ch);
            push(ch, 'test1');
            await next();
            expect((await next()).value).toEqual('test1');
            expect(ch[PutBuffer].getSize()).toEqual(0);
            expect(ch[Values].length).toEqual(0);
        });
    });

    describe('when there is no value in channel', () => {
        it('should return null', async () => {
            const ch = makeChannel();
            const { next } = integrationTestGeneratorRunner(poll(ch));
            expect((await next()).value).toEqual(null);
            expect(ch[PutBuffer].getSize()).toEqual(0);
            expect(ch[Values].length).toEqual(0);
        });
    });

    describe('when channel is closed', () => {
        it('should return null', async () => {
            const ch = makeChannel();
            const { next } = integrationTestGeneratorRunner(poll(ch));
            close(ch);
            expect((await next()).value).toEqual(null);
            expect(ch[PutBuffer].getSize()).toEqual(0);
            expect(ch[Values].length).toEqual(0);
        });
    });
});
