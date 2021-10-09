import { go } from '../go';

export const eventLoopQueue = () => {
    return new Promise<void>((resolve) =>
        setImmediate(() => {
            resolve();
        }),
    );
};

export const delay = (ms: number) => {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

export function makeChannel() {
    return {
        putQueue: [] as unknown[],
        takeQueue: [] as unknown[],

        makePut(data: unknown) {
            this.putQueue.push(data);
        },

        makeTake() {
            this.takeQueue.push(null);
        },

        releasePut() {
            return this.putQueue.shift();
        },

        releaseTake() {
            this.takeQueue.shift();
        },

        async waitForIncomingTake() {
            while (this.takeQueue.length === 0) {
                await eventLoopQueue();
            }
        },

        async waitForIncomingPut() {
            while (this.putQueue.length === 0) {
                await eventLoopQueue();
            }
        },

        async waitForPutQueueToRelease() {
            while (this.putQueue.length !== 0) {
                await eventLoopQueue();
            }
        },

        async waitForTakeQueueToRelease() {
            while (this.takeQueue.length !== 0) {
                await eventLoopQueue();
            }
        },

        // in order to put, you need to place an item into putQueue and wait for take to appear
        // after that you pop the item from putQueue
        async put(data: unknown) {
            await this.waitForPutQueueToRelease();
            this.makePut(data);
            await this.waitForIncomingTake();
        },

        // in order to take, you need to place an item into takequeue and wait for put to appear
        // after that you pop the item from takeQueue
        async take() {
            await this.waitForTakeQueueToRelease();
            this.makeTake();
            await this.waitForIncomingPut();
            this.releaseTake();
            return this.releasePut();
        },
    };
}

const ch = makeChannel();

go(function* () {
    console.log('Через 4 секунды первый гопник смешно пошутит');
    yield delay(4000);
    yield ch.put('ЛАЛ САСИ ЧЕБУРЕЧА');
    console.log('** ДЫААА ЭТО ТОЧНО ЕГО ЗАТРАЛЛИТ **');
    const reply = yield ch.take();
    console.log('ГОПНИКУ ОДИН ПРИЛЕТЕЛА ОТВЕТОЧКА', reply);
});

go(function* () {
    console.log('** УХ ЩА В ЧАТИКЕ ПООБЩАЮСЬ **');
    const message = yield ch.take();
    console.log('ГОПНИКУ ДВА ПРИЛЕТЕЛО СООБЩЕНИЕ: ', message);
    console.log('** ЧО ТЫ ТАМ БАЗАРИШЬ МЫШЬ? **');
    yield ch.put('POSHEL NAHUI');
});
