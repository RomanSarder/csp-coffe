import { call, fork, go } from '@Lib/go';
import { fakeAsyncFunction } from '@Lib/internal';
import { CancelError } from '@Lib/runner';
import { delay } from '@Lib/shared';

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

    it('should execute yielded generators', async () => {
        const executionOrder = [] as number[];

        function* innerGenerator() {
            executionOrder.push(2);
            yield delay(500);
            executionOrder.push(3);
        }

        function* testGenerator() {
            const result1: number = yield fakeAsyncFunction(() => 1);
            executionOrder.push(result1);
            yield innerGenerator();
        }

        const { cancellablePromise } = go(testGenerator);

        await cancellablePromise;

        expect(executionOrder).toEqual([1, 2, 3]);
    });

    it('should execute call instructions', async () => {
        const executionOrder = [] as number[];

        function* innerGenerator() {
            executionOrder.push(2);
            yield delay(500);
            executionOrder.push(3);
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
});
