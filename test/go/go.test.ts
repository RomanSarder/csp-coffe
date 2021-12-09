import { call } from '@Lib/go/instructions/call';
import { fork } from '@Lib/go/instructions/fork';
import { spawn } from '@Lib/go/instructions/spawn';
import { go } from '@Lib/go/go';
import { fakeAsyncFunction } from '@Lib/internal';
import { close } from '@Lib/operators/core/close';
import { CancelError } from '@Lib/cancellablePromise';
import { delay } from '@Lib/shared/utils/delay';

describe('go', () => {
    it('should execute both sync and async yield statements in a correct order', async () => {
        const executionOrder = [] as number[];

        function* testGenerator() {
            const result1: number = yield fakeAsyncFunction(() => 1);
            executionOrder.push(result1);
            executionOrder.push(2);
        }

        const { cancellablePromise } = go(testGenerator);

        await cancellablePromise;

        expect(executionOrder).toEqual([1, 2]);
    });

    it('should execute yielded nested generators', async () => {
        const executionOrder = [] as number[];

        function* innerGenerator() {
            executionOrder.push(2);
            yield delay(500);
            executionOrder.push(3);
            return 4;
        }

        function* testGenerator() {
            const result1: number = yield fakeAsyncFunction(() => 1);
            executionOrder.push(result1);
            const result2: number = yield innerGenerator();
            executionOrder.push(result2);
        }

        const { cancellablePromise } = go(testGenerator);

        await cancellablePromise;

        expect(executionOrder).toEqual([1, 2, 3, 4]);
    });

    it('should execute call instructions', async () => {
        const executionOrder = [] as number[];

        function* innerGenerator2() {
            yield delay(500);
            return 3;
        }

        function* innerGenerator() {
            executionOrder.push(2);
            yield delay(500);
            const innerGenResult: number = yield call(innerGenerator2);
            executionOrder.push(innerGenResult);
        }

        function* testGenerator() {
            const result1: number = yield call(fakeAsyncFunction, () => 1);
            executionOrder.push(result1);
            yield call(innerGenerator);
        }

        const { cancellablePromise } = go(testGenerator);

        await cancellablePromise;

        expect(executionOrder).toEqual([1, 2, 3]);
    });

    describe('when there are forked generators', () => {
        it('should wait for forked generators to complete', async () => {
            const executionOrder = [] as number[];

            function* innerGen() {
                executionOrder.push(3);
                yield delay(1000);
                executionOrder.push(4);
            }

            function* testGenerator() {
                yield executionOrder.push(1);
                const result: number = yield fakeAsyncFunction(() => 2);
                executionOrder.push(result);
                yield fork(innerGen);
                executionOrder.push(5);
            }

            const { cancellablePromise } = go(testGenerator);
            await cancellablePromise;
            expect(executionOrder).toEqual([1, 2, 3, 5, 4]);
        });

        it('should propagate error to the parent', async () => {
            const spy = jest.fn();

            function* innerGen() {
                yield;
                throw new Error('Custom');
            }

            function* testGenerator() {
                try {
                    yield fork(innerGen);
                    yield delay(1000);
                } catch (e) {
                    spy(e);
                }
            }

            const { cancellablePromise } = go(testGenerator);
            await cancellablePromise;

            expect(spy).toHaveBeenCalledWith(new Error('Custom'));
        });
    });

    describe('when there are spawned generators', () => {
        it('should execute them without blocking', async () => {
            const executionOrder = [] as number[];

            function* innerGen() {
                yield delay(1000);
                executionOrder.push(2);
            }

            function* testGenerator() {
                yield spawn(innerGen);
                executionOrder.push(1);
            }

            const { cancellablePromise } = go(testGenerator);
            await delay(1500);
            await cancellablePromise;
            expect(executionOrder).toEqual([1, 2]);
        });

        it('should not propagate error to parent', async () => {
            const spy = jest.fn();

            function* innerGen() {
                yield new Error('Custom');
            }

            function* testGenerator() {
                try {
                    yield spawn(innerGen);
                    yield delay(1500);
                } catch (e) {
                    spy(e);
                }
            }

            const { cancellablePromise } = go(testGenerator);
            await cancellablePromise;
            expect(spy).not.toHaveBeenCalled();
        });
    });

    describe('when cancelled', () => {
        it('should throw an error inside a generator', async () => {
            const executionOrder = [] as number[];
            const spy = jest.fn();

            function* testGenerator() {
                try {
                    const result1: number = yield call(
                        fakeAsyncFunction,
                        () => 1,
                    );
                    executionOrder.push(result1);
                    yield delay(1500);
                    executionOrder.push(2);
                } catch (e) {
                    spy(e);
                }
            }

            const { cancellablePromise } = go(testGenerator);
            await delay(1000);
            await cancellablePromise.cancel();

            expect(executionOrder).toEqual([1]);
            expect(spy).toHaveBeenCalledWith(new CancelError());
        });

        it('should cancel all forked generators', async () => {
            const executionOrder = [] as number[];
            const innerSpy = jest.fn();
            const outerSpy = jest.fn();

            function* innerGen() {
                try {
                    executionOrder.push(3);
                    yield delay(1500);
                    executionOrder.push(4);
                } catch (e) {
                    innerSpy(e);
                }
            }

            function* testGenerator() {
                try {
                    yield executionOrder.push(1);
                    const result: number = yield fakeAsyncFunction(() => 2);
                    executionOrder.push(result);
                    yield fork(innerGen);
                    executionOrder.push(5);
                } catch (e) {
                    outerSpy(e);
                }
            }

            const { cancellablePromise } = go(testGenerator);
            await delay(1500);
            await cancellablePromise.cancel();
            expect(executionOrder).toEqual([1, 2, 3, 5]);
            expect(innerSpy).toHaveBeenCalledWith(new CancelError());
        });
    });

    it('should return a channel with a value of generator return', async () => {
        function* testGenerator() {
            yield 5;
            return 10;
        }

        const { channel, cancellablePromise } = go(testGenerator);
        await cancellablePromise;
        expect(channel.putBuffer.getElementsArray()).toEqual([10]);
        close(channel);
    });
});
