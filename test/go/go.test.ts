import { CreatableBufferType } from '@Lib/buffer';
import { Channel, makeChannel } from '@Lib/channel';
import { call, Events, schedule, go } from '@Lib/go';
import { fakeAsyncFunction } from '@Lib/internal';
import { put } from '@Lib/operators';
import { delay } from '@Lib/shared';
// import { eventLoopQueue, fakeAsyncFunction } from '@Lib/internal';

// import { delay } from '@Lib/shared';
// import { take } from '@Lib/operators';

describe('go', () => {
    it('should execute both sync and async yield statements in a correct order', async () => {
        const executionOrder = [] as number[];

        function* testGenerator() {
            yield executionOrder.push(1);
            const result: number = yield fakeAsyncFunction(() => 2);
            executionOrder.push(result);
            yield executionOrder.push(3);
            return 5;
        }

        const { promise } = go(testGenerator);

        await promise;

        expect(executionOrder).toEqual([1, 2, 3]);
    });

    it('should execute generator yields', async () => {
        const executionOrder = [] as number[];

        function* testInnerGenerator() {
            executionOrder.push(4);
            yield delay(500);
            executionOrder.push(5);
            return 6;
        }

        function* testGenerator() {
            yield executionOrder.push(1);
            const result: number = yield fakeAsyncFunction(() => 2);
            executionOrder.push(result);
            yield executionOrder.push(3);
            yield testInnerGenerator();
        }

        const { promise } = go(testGenerator);

        await promise;

        expect(executionOrder).toEqual([1, 2, 3, 4, 5]);
    });

    it('should return the last yielded value', async () => {
        function* testGenerator() {
            yield fakeAsyncFunction(() => 'sasi');
            return 'test';
        }

        const { promise } = go(testGenerator);

        const result = await promise;

        expect(result).toEqual('test');
    });

    it('should cancel from outside', async () => {
        const genSpy = jest.fn();

        function* testGenerator() {
            yield fakeAsyncFunction(() => 'sasi');
            yield genSpy();
            yield true;
            return 'test';
        }

        const { cancel, promise } = go(testGenerator);
        await cancel();
        await promise;
        expect(genSpy).not.toHaveBeenCalled();
    });

    it('should cancel from inside', async () => {
        const genSpy = jest.fn();

        function* testGenerator() {
            yield fakeAsyncFunction(() => 'sasi');
            yield Events.CANCELLED;
            yield genSpy();
            yield true;
            return 'test';
        }

        const { promise } = go(testGenerator);
        const result = await promise;
        expect(result).toEqual(Events.CANCELLED);
        expect(genSpy).not.toHaveBeenCalled();
    });

    it('should return channel which contains returned value', async () => {
        function* testGenerator() {
            const result: string = yield fakeAsyncFunction(() => 'test1');
            return result;
        }

        const { channel, promise } = go(testGenerator);

        await promise;

        expect(channel.putBuffer.getElementsArray()).toEqual(['test1']);
    });

    it('should run execute tasks', async () => {
        function* testInnerGenerator(returnVal: any) {
            yield 5;
            return returnVal;
        }

        function* testGenerator(ch: Channel<any>) {
            const asyncValue: string = yield call(
                fakeAsyncFunction,
                () => 'test1',
            );
            const res: boolean = yield call(put, ch, asyncValue);
            const res2: string = yield call(testInnerGenerator, 'test2');
            yield put(ch, res2);
            const res4: string = yield testInnerGenerator('test3');
            yield schedule(testInnerGenerator, 'test4');
            yield put(ch, res4);
            return res;
        }
        const ch = makeChannel(CreatableBufferType.UNBLOCKING);

        const { promise } = go(testGenerator, ch);

        await promise;
        expect(ch.putBuffer.getElementsArray()).toEqual([
            'test1',
            'test2',
            'test3',
        ]);
    });

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
