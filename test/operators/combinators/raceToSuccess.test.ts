import { call } from '@Lib/go/instructions/call';
import { go } from '@Lib/go/go';
import { raceToSuccess } from '@Lib/operators/combinators/raceToSuccess';
import { delay } from '@Lib/shared/utils/delay';

describe('race', () => {
    it('should resolve once any of the runners is successfully completed and cancel others', async () => {
        const executionOrder: number[] = [];

        function* innerGenerator1() {
            yield delay(1000);
            throw new Error('should not see this one');
        }

        function* innerGenerator2() {
            yield delay(1200);
            return 2;
        }

        function* outerGenerator() {
            const result: number = yield raceToSuccess(
                call(innerGenerator1),
                call(innerGenerator2),
            );
            executionOrder.push(result);
        }

        const { cancellablePromise } = go(outerGenerator);

        await cancellablePromise;

        expect(executionOrder).toEqual([2]);
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
            yield raceToSuccess(call(innerGenerator1), call(innerGenerator2));
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
            throw Error('Custom error 2');
        }

        function* outerGenerator() {
            try {
                yield raceToSuccess(
                    call(innerGenerator1),
                    call(innerGenerator2),
                );
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
