import { makeQueue } from './queue';

// Queue that drops an update if full
export function makeDroppingQueue<T = unknown>(capacity: number | null = 1) {
    return {
        ...makeQueue<T>(capacity),
        add(data: T): void {
            if (
                capacity !== null &&
                this.getSize() < (this.capacity as number)
            ) {
                this.contents[this.tail] = data;
                this.tail += 1;
            }
        },
    };
}
