import * as channel from '@Lib/channel';
import { makeChannel } from '@Lib/channel';
import { eventLoopQueue } from '@Lib/internal';

describe('Channel', () => {
    describe('makeChannel', () => {
        it('should create a channel with queues', () => {
            const ch = channel.makeChannel();

            expect(ch.putBuffer.getElementsArray()).toEqual([]);
            expect(ch.takeBuffer.getElementsArray()).toEqual([]);
        });
    });

    describe('makePut', () => {
        it('should put a given value to put queue', () => {
            const ch = channel.makeChannel();
            channel.makePut(ch, 'test1');
            expect(ch.putBuffer.getElementsArray()[0]).toEqual('test1');
        });
    });

    describe('makeTake', () => {
        it('should put an item to take queue', () => {
            const ch = channel.makeChannel();
            channel.makeTake(ch);
            expect(ch.takeBuffer.getSize()).toEqual(1);
        });
    });

    describe('releaseTake', () => {
        it('should remove first item from the take queue', () => {
            const ch = channel.makeChannel();
            channel.makeTake(ch);
            channel.releaseTake(ch);
            expect(ch.takeBuffer.getSize()).toEqual(0);
        });
    });

    describe('releasePut', () => {
        it('should remove first item from the put queue and return it', () => {
            const ch = channel.makeChannel();
            channel.makePut(ch, 'test1');
            const result = channel.releasePut(ch);
            expect(result).toEqual('test1');
            expect(ch.putBuffer.getSize()).toEqual(0);
        });
    });

    describe('waitForIncomingTake', () => {
        it('should return promise which resolves only after any item gets to take queue', async () => {
            const spy = jest.fn();
            const ch = channel.makeChannel();
            channel.waitForIncomingTake(ch).then(spy);
            await eventLoopQueue();
            expect(spy).not.toHaveBeenCalled();
            channel.makeTake(ch);
            await eventLoopQueue();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('waitForIncomingPut', () => {
        it('should return promise which resolves only after any item gets to put queue', async () => {
            const spy = jest.fn();
            const ch = channel.makeChannel();
            channel.waitForIncomingPut(ch).then(spy);
            await eventLoopQueue();
            expect(spy).not.toHaveBeenCalled();
            channel.makePut(ch, 'test');
            await eventLoopQueue();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('waitForPutQueueToRelease', () => {
        it('should return promise which resolves only after put queue becomes empty', async () => {
            const spy = jest.fn();
            const ch = channel.makeChannel();
            channel.makePut(ch, 'test');
            channel.waitForPutQueueToRelease(ch).then(spy);
            await eventLoopQueue();
            expect(spy).not.toHaveBeenCalled();
            channel.releasePut(ch);
            await eventLoopQueue();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('waitForTakeQueueToRelease', () => {
        it('should return promise which resolves only after put queue becomes empty', async () => {
            const spy = jest.fn();
            const ch = channel.makeChannel();
            channel.makeTake(ch);
            channel.waitForTakeQueueToRelease(ch).then(spy);
            await eventLoopQueue();
            expect(spy).not.toHaveBeenCalled();
            channel.releaseTake(ch);
            await eventLoopQueue();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });

    describe('take', () => {
        it('should take a put value from channel', async () => {
            const ch = makeChannel();
            const spy = jest.fn();
            channel.take(ch).then(spy);
            await eventLoopQueue();
            channel.put(ch, 'test1');
            await eventLoopQueue();
            expect(spy).toHaveBeenCalledWith('test1');
        });
    });

    describe('put', () => {
        it('should put a value to channel', async () => {
            const ch = makeChannel();
            const spy = jest.fn();
            channel.put(ch, 'test1').then(spy);
            await eventLoopQueue();
            expect(ch.putBuffer.getElementsArray()[0]).toEqual('test1');
            await eventLoopQueue();
            channel.makeTake(ch);
            await eventLoopQueue();
            expect(spy).toHaveBeenCalledTimes(1);
        });
    });
});
