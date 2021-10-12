export function makeQueue<T = unknown>(capacity = 1) {
    return {
        capacity,
        tail: 0,
        head: 0,
        contents: {} as Record<number, T>,

        getSize(): number {
            return this.tail;
        },

        getCapacity(): number {
            return this.capacity;
        },

        getElementsArray(): T[] {
            return Object.values(this.contents).map((val) => val);
        },

        add(data: T) {
            if (this.getSize() >= this.capacity) {
                this.release();
            }
            this.contents[this.tail] = data;
            this.tail += 1;
        },

        release(): T | undefined {
            if (this.getSize() > 0) {
                const element = this.contents[this.head];
                delete this.contents[this.head];
                if (this.head < this.tail) {
                    // When head is equal to tail it means there are no elements in the queue.
                    // There is no need to increase head if there are no elements.
                    // Head can't be greater than tail, that is why we only increment head if head is lower than tails.
                    // We make sure that head is always pointing to a number equal or lower than tails.
                    this.head += 1;
                }
                return element;
            }
            return undefined;
        },
    };
}
