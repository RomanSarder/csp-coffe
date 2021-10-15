import { makeQueue } from './queue';

export function makeDroppingQueue<T = unknown>(capacity = 1) {
    return {
        ...makeQueue<T>(capacity),
        add(data: T): void {
            if (this.getSize() < this.capacity) {
                this.contents[this.tail] = data;
                this.tail += 1;
            }
        },
    };
}
