import { Events, go } from '@Lib/go';
import { eventLoopQueue, fakeAsyncFunction } from '@Lib/internal';
// import { take } from '@Lib/operators';

describe('go', () => {
    // it('should execute both sync and async yield statements in a correct order', async () => {
    //     const executionOrder = [] as number[];

    //     function* testGenerator() {
    //         yield executionOrder.push(1);
    //         const result: number = yield fakeAsyncFunction(() => 2);
    //         executionOrder.push(result);
    //         yield executionOrder.push(3);
    //     }

    //     const { promise } = go(testGenerator);

    //     await promise;

    //     expect(executionOrder).toEqual([1, 2, 3]);
    // });

    // it('should return the last yielded value', async () => {
    //     function* testGenerator() {
    //         yield fakeAsyncFunction(() => 'sasi');
    //         return 'test';
    //     }

    //     const { promise } = go(testGenerator);

    //     const result = await promise;

    //     expect(result).toEqual('test');
    // });

    it('should cancel', async () => {
        const spy = jest.fn();
        const genSpy = jest.fn();

        function* testGenerator() {
            yield fakeAsyncFunction(() => 'sasi');
            yield genSpy();
            return 'test';
        }

        const { cancel, promise } = go(testGenerator);
        promise.then(spy);
        cancel();
        await eventLoopQueue();
        expect(spy).toHaveBeenCalledWith(Events.CANCELLED);
        expect(genSpy).not.toHaveBeenCalled();
    });

    // it('should return channel which contains returned value', async () => {
    //     function* testGenerator() {
    //         const result: string = yield fakeAsyncFunction(() => 'test1');
    //         return result;
    //     }

    //     const { channel } = go(testGenerator);

    //     expect(channel.putBuffer.getElementsArray()).toEqual(['test1']);
    // });

    // it('should return channel which closes after taking a value', async () => {
    //     function* testGenerator() {
    //         const result: string = yield fakeAsyncFunction(() => 'test1');
    //         return result;
    //     }

    //     const { channel } = go(testGenerator);

    //     expect(await take(channel)).toEqual('test1');
    // });

    // describe('when fork command is yielded', () => {
    //     it('should wait until all forked processes complete before resolving', async () => {
    //         let isForkCompleted = false;

    //         function* testGenerator() {
    //             const result: string = yield fakeAsyncFunction(() => 'test1');
    //             yield fork(function* forkedFn() {
    //                 yield fakeAsyncFunction(() => {
    //                     isForkCompleted = true;
    //                 });
    //             });
    //             return result;
    //         }

    //         const { promise } = go(testGenerator);
    //         await promise;
    //         expect(isForkCompleted).toEqual(true);
    //     });

    //     describe('when root generator is cancelled', () => {
    //         it('should cancel forked generator', async () => {
    //             const forkSpy = jest.fn();

    //             function* testGenerator() {
    //                 const result: string = yield fakeAsyncFunction(
    //                     () => 'test1',
    //                 );
    //                 yield fork(function* forkedFn() {
    //                     yield fakeAsyncFunction(() => 'testval');
    //                     yield forkSpy();
    //                 });
    //                 return result;
    //             }

    //             const { cancel } = go(testGenerator);
    //             cancel();
    //             await eventLoopQueue();
    //             await eventLoopQueue();
    //             expect(forkSpy).not.toHaveBeenCalled();
    //         });
    //     });
    // });
});
