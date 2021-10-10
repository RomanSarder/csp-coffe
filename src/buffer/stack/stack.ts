export function makeStack<T = unknown>(capacity = 1) {
    return {
        capacity,
        size: 0,
        contents: {} as Record<number, T>,

        getSize(): number {
            return this.size;
        },

        push(data: T): void {
            if (this.size < this.capacity) {
                this.contents[this.size + 1] = data;
                this.size += 1;
            }
        },

        pop(): T {
            const value = this.contents[this.size - 1];
            this.size -= 1;
            delete this.contents[this.size];

            if (this.size < 0) {
                this.size = 0;
            }

            return value;
        },
    };
}
