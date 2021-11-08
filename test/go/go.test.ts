import { CreatableBufferType } from '@Lib/buffer';
import { CANCEL, CancellableTask } from '@Lib/cancellableTask';
import { Channel, makeChannel } from '@Lib/channel';
import { call, go, fork } from '@Lib/go';
// import { fakeAsyncFunction } from '@Lib/internal';
import { put } from '@Lib/operators';
import { delay } from '@Lib/shared';
// // import { delay } from '@Lib/shared';
// // import { take } from '@Lib/operators';

// describe('go', () => {
//     it('should execute both sync and async yield statements in a correct order', async () => {
//         const executionOrder = [] as number[];

//         function* testGenerator() {
//             yield executionOrder.push(1);
//             const result: number = yield fakeAsyncFunction(() => 2);
//             executionOrder.push(result);
//             yield executionOrder.push(3);
//             return 5;
//         }

//         const { promise } = go(testGenerator);

//         await promise;

//         expect(executionOrder).toEqual([1, 2, 3]);
//     });

//     it('should execute generator yields', async () => {
//         const executionOrder = [] as number[];

//         function* testInnerGenerator() {
//             executionOrder.push(4);
//             yield delay(500);
//             executionOrder.push(5);
//             return 6;
//         }

//         function* testGenerator() {
//             yield executionOrder.push(1);
//             const result: number = yield fakeAsyncFunction(() => 2);
//             executionOrder.push(result);
//             yield executionOrder.push(3);
//             yield testInnerGenerator();
//         }

//         const { promise } = go(testGenerator);

//         await promise;

//         expect(executionOrder).toEqual([1, 2, 3, 4, 5]);
//     });

//     it('should return the last yielded value', async () => {
//         function* testGenerator() {
//             yield fakeAsyncFunction(() => 'sasi');
//             return 'test';
//         }

//         const { promise } = go(testGenerator);

//         const result = await promise;

//         expect(result).toEqual('test');
//     });

//     it('should cancel from outside', async () => {
//         const genSpy = jest.fn();

//         function* testGenerator() {
//             yield fakeAsyncFunction(() => 'sasi');
//             yield genSpy();
//             yield true;
//             return 'test';
//         }

//         const { cancel, task } = go(testGenerator);
//         await cancel();
//         await task;
//         expect(genSpy).not.toHaveBeenCalled();
//     });

//     it('should cancel from inside', async () => {
//         const genSpy = jest.fn();

//         function* testGenerator() {
//             yield fakeAsyncFunction(() => 'sasi');
//             yield Events.CANCELLED;
//             yield genSpy();
//             yield true;
//             return 'test';
//         }

//         const { promise } = go(testGenerator);
//         const result = await promise;
//         expect(result).toEqual(Events.CANCELLED);
//         expect(genSpy).not.toHaveBeenCalled();
//     });

//     it('should return channel which contains returned value', async () => {
//         function* testGenerator() {
//             const result: string = yield fakeAsyncFunction(() => 'test1');
//             return result;
//         }

//         const { channel, promise } = go(testGenerator);

//         await promise;

//         expect(channel.putBuffer.getElementsArray()).toEqual(['test1']);
//     });

it('should run mix of call, schedule and yield instructions', async () => {
    // function* testInnerGenerator(returnVal: any) {
    //     yield 5;
    //     return returnVal;
    // }

    function* testDelayedInnerGenerator(ch: Channel<any>, data: any) {
        try {
            yield delay(1000);
            yield put(ch, data);
            console.log('delayed done');
        } catch (e) {
            console.log('GOT YOU', e);
        }
    }

    function* testGenerator(ch: Channel<any>) {
        // const asyncValue: string = yield call(fakeAsyncFunction, () => 'test1');
        // const res: boolean = yield call(put, ch, asyncValue);
        try {
            const task: CancellableTask<any> = yield fork(
                testDelayedInnerGenerator,
                ch,
                'test2',
            );
            yield call(task[CANCEL]);
            // const res4: string = yield testInnerGenerator('test3');
            // yield schedule(testInnerGenerator, 'test4');
            // yield put(ch, res4);
        } catch (e) {
            console.log('ERROR GOT', e);
        }
    }
    const ch = makeChannel(CreatableBufferType.UNBLOCKING);

    try {
        const { task } = go(testGenerator, ch);

        await task;
    } catch (e) {
        console.log('CATCH');
    }
    expect(ch.putBuffer.getElementsArray()).toEqual([]);
});

//     describe('when issued a fork instruction', () => {
//         it('should not end root generator until forked tasks are done', async () => {
//             const forkedExecutionOrder: number[] = [];

//             function* innerGenerator() {
//                 yield delay(1000);
//                 yield forkedExecutionOrder.push(1);
//                 return 20;
//             }

//             function* secondInnerGenerator() {
//                 yield delay(1500);
//                 yield forkedExecutionOrder.push(2);
//                 return 20;
//             }

//             function* testGenerator() {
//                 yield fork(innerGenerator);
//                 yield fork(secondInnerGenerator);
//                 forkedExecutionOrder.push(1);
//                 return 30;
//             }

//             const { promise } = go(testGenerator);

//             await promise;

//             expect(forkedExecutionOrder).toEqual([1, 2, 3]);
//         });
//     });

//     // it('should return channel which closes after taking a value', async () => {
//     //     function* testGenerator() {
//     //         const result: string = yield fakeAsyncFunction(() => 'test1');
//     //         return result;
//     //     }

//     //     const { channel } = go(testGenerator);

//     //     expect(await take(channel)).toEqual('test1');
//     // });
// });
