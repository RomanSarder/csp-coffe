import { makeChannel } from '../../src/channel';
import { go } from '../../src/go';
import { CallInstruction } from '../../src/instruction';
import { CancellablePromise, cancelAll } from '../../src/cancellablePromise';
import {
    take,
    put,
    all,
    putAsync,
    filter,
    fork,
    call,
    close,
} from '../../src/operators';
import { CreatableBufferType } from '../../src/buffer';
import { cookerWorker, randomIntFromInterval } from './cookerWorker';

import type { KitchenRequest, Order } from './entity';
import { delay } from '../../src/shared/utils';

const tillsChannel = makeChannel<KitchenRequest>(CreatableBufferType.FIXED, 2);
const kitchenDeliveryChannel = makeChannel<KitchenRequest>(
    CreatableBufferType.UNBLOCKING,
);
const orderDeliveryChannel = makeChannel<Order>(CreatableBufferType.UNBLOCKING);
const burgerCookerChannel = makeChannel(CreatableBufferType.FIXED, 2);
const frenchFriesCookerChannel = makeChannel(CreatableBufferType.FIXED, 2);
const drinksCookerChannel = makeChannel(CreatableBufferType.FIXED, 2);
const dessertCookerChannel = makeChannel(CreatableBufferType.FIXED, 1);
const soucesCookerChannel = makeChannel(CreatableBufferType.UNBLOCKING);
const coffeeCookerChannel = makeChannel(CreatableBufferType.FIXED, 2);

const deliveredOrders: any = {};

function* orderWorkerRoutine(order: Order) {
    console.log(`Order number ${order.id} is preparing...`);
    const kitchenRequests: CallInstruction[] = [];
    let orderItemsDeliveredCount = 0;

    order.items.forEach((item) => {
        const kitchenRequest: KitchenRequest = { item, orderId: order.id };
        switch (item) {
            case 'burger': {
                kitchenRequests.push(
                    call(put, burgerCookerChannel, kitchenRequest),
                );
                break;
            }
            case 'french fries': {
                kitchenRequests.push(
                    call(put, frenchFriesCookerChannel, kitchenRequest),
                );
                break;
            }
            case 'cola': {
                kitchenRequests.push(
                    call(put, drinksCookerChannel, kitchenRequest),
                );
                break;
            }
            case 'dessert': {
                kitchenRequests.push(
                    call(put, dessertCookerChannel, kitchenRequest),
                );
                break;
            }
            case 'souce': {
                kitchenRequests.push(
                    call(put, soucesCookerChannel, kitchenRequest),
                );
                break;
            }
            case 'coffee': {
                kitchenRequests.push(
                    call(put, coffeeCookerChannel, kitchenRequest),
                );
            }
        }
    });

    yield all(...kitchenRequests);

    deliveredOrders[order.id] = [];
    const { ch: currentOrderKitchenDeliveryChannel } = filter(
        (deliveredOrder) => {
            return order.id === deliveredOrder.orderId;
        },
        [kitchenDeliveryChannel],
    );

    while (orderItemsDeliveredCount < order.items.length) {
        const deliveredItem: KitchenRequest = yield take(
            currentOrderKitchenDeliveryChannel,
        );
        deliveredOrders[order.id].push(deliveredItem.item);
        orderItemsDeliveredCount += 1;

        console.log(
            `Order ${order.id} has ${orderItemsDeliveredCount} items ready oout of ${order.items.length}`,
        );
    }

    yield put(orderDeliveryChannel, order);
    console.log(`Order number ${order.id} has been delivered!`);
}

function* watchOrders() {
    const promises: CancellablePromise<any>[] = [];
    while (tillsChannel.isClosed === false) {
        const order: Order = yield take(tillsChannel);
        promises.push(yield fork(orderWorkerRoutine, order));
    }
    yield Promise.all(promises);
}

// "я смотрю за входящими заказами "

async function generateOrders() {
    const orders: Order[] = [
        {
            id: 1,
            items: [
                'burger',
                'burger',
                'french fries',
                'dessert',
                'cola',
                'cola',
            ],
        },
        {
            id: 2,
            items: ['burger', 'cola', 'french fries'],
        },
        {
            id: 3,
            items: ['dessert', 'coffee'],
        },
        {
            id: 4,
            items: ['cola'],
        },
        {
            id: 5,
            items: ['burger', 'souce', 'cola'],
        },
        {
            id: 6,
            items: ['french fries', 'souce', 'coffee'],
        },
    ];

    const promises = orders.map(async (order, index) => {
        await delay(randomIntFromInterval(500, 1000 * (index + 1)));
        await putAsync(tillsChannel, order);
    });
    await Promise.all(promises);
    close(tillsChannel);
}

const { cancellablePromise: workerPromise1 } = go(
    cookerWorker,
    burgerCookerChannel,
    kitchenDeliveryChannel,
);
const { cancellablePromise: workerPromise2 } = go(
    cookerWorker,
    frenchFriesCookerChannel,
    kitchenDeliveryChannel,
);
const { cancellablePromise: workerPromise3 } = go(
    cookerWorker,
    drinksCookerChannel,
    kitchenDeliveryChannel,
);
const { cancellablePromise: workerPromise4 } = go(
    cookerWorker,
    dessertCookerChannel,
    kitchenDeliveryChannel,
);
const { cancellablePromise: workerPromise5 } = go(
    cookerWorker,
    soucesCookerChannel,
    kitchenDeliveryChannel,
);
const { cancellablePromise: workerPromise6 } = go(
    cookerWorker,
    coffeeCookerChannel,
    kitchenDeliveryChannel,
);
const { cancellablePromise } = go(watchOrders);

generateOrders();

cancellablePromise.then(async () => {
    close(burgerCookerChannel);
    close(frenchFriesCookerChannel);
    close(drinksCookerChannel);
    close(soucesCookerChannel);
    close(coffeeCookerChannel);
    close(dessertCookerChannel);
    close(tillsChannel);
    close(orderDeliveryChannel);
    close(kitchenDeliveryChannel);
    await cancelAll([
        workerPromise1,
        workerPromise2,
        workerPromise3,
        workerPromise4,
        workerPromise5,
        workerPromise6,
    ]);
    return undefined;
});
