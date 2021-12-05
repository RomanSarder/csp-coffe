import { call, go } from '@Lib/go';
import { race } from '@Lib/operators/flow/race';
import { delay } from '@Lib/shared/utils/delay';

describe('race', () => {
    it('should resolve once any of the runners is completed and cancel others', async () => {
        const executionOrder: number[] = [];

        function* innerGenerator1() {
            yield delay(1000);
            return 1;
        }

        function* innerGenerator2() {
            yield delay(1200);
            return 2;
        }

        function* outerGenerator() {
            const result: number = yield race(
                call(innerGenerator1),
                call(innerGenerator2),
            );
            executionOrder.push(result);
        }

        const { cancellablePromise } = go(outerGenerator);

        await cancellablePromise;

        expect(executionOrder).toEqual([1]);
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
            yield race(call(innerGenerator1), call(innerGenerator2));
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
                yield race(call(innerGenerator1), call(innerGenerator2));
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
