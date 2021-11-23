import { asyncGeneratorProxy } from '@Lib/asyncGeneratorProxy';
import { call, go } from '@Lib/go';
import { all } from '@Lib/operators/flow/all';
import { delay } from '@Lib/shared/utils/delay';

describe('all', () => {
    it('should wait for generators to finish', async () => {
        const executionOrder: number[] = [];

        function* innerGenerator1() {
            yield delay(1000);
            executionOrder.push(1);
        }

        function* innerGenerator2() {
            yield delay(1200);
            executionOrder.push(2);
        }

        function* outerGenerator() {
            yield all(call(innerGenerator1), call(innerGenerator2));
            executionOrder.push(3);
        }

        const { cancellablePromise } = go(outerGenerator);

        await cancellablePromise;
        expect(executionOrder).toEqual([1, 2, 3]);
    });

    it('should run call instructions on provided generators', async () => {
        function* innerGenerator1() {
            yield delay(1000);
        }

        function* innerGenerator2() {
            yield delay(1200);
        }

        function* outerGenerator() {
            yield all(call(innerGenerator1), call(innerGenerator2));
        }
        const iterator = asyncGeneratorProxy(outerGenerator());

        console.log(await iterator.next());
    });

    it('should cancell all generators', async () => {
        const executionOrder: number[] = [];

        function* innerGenerator1() {
            yield delay(1000);
            executionOrder.push(1);
        }

        function* innerGenerator2() {
            yield delay(1200);
            executionOrder.push(2);
        }

        function* outerGenerator() {
            yield all(call(innerGenerator1), call(innerGenerator2));
            executionOrder.push(3);
        }

        const { cancellablePromise } = go(outerGenerator);
        await delay(100);
        await cancellablePromise.cancel();

        expect(executionOrder).toEqual([]);
    });

    it('should propagate error to parent generator', async () => {
        const executionOrder: number[] = [];
        const spy = jest.fn();

        function* innerGenerator1() {
            yield delay(1000);
            throw Error('Custom error');
        }

        function* innerGenerator2() {
            yield delay(1200);
            executionOrder.push(2);
        }

        function* outerGenerator() {
            try {
                yield all(call(innerGenerator1), call(innerGenerator2));
                executionOrder.push(3);
            } catch (e) {
                spy(e);
            }
        }

        const { cancellablePromise } = go(outerGenerator);
        await cancellablePromise;

        expect(executionOrder).toEqual([]);
        expect(spy).toHaveBeenCalledWith(new Error('Custom error'));
    });
});
