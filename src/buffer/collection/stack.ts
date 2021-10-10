export function makeStack<T = unknown>(capacity = 1) {
    return {
        capacity,
        size: 0,
        contents: {} as Record<number, T>,

        getSize(): number {
            return this.size;
        },

        getElementsArray(): T[] {
            return Object.values(this.contents).map((val) => val);
        },

        add(data: T): void {
            if (this.size >= this.capacity) {
                return;
            }
            this.contents[this.size + 1] = data;
            this.size += 1;
        },

        release(): T {
            const value = this.contents[this.size];
            delete this.contents[this.size];
            this.size -= 1;

            if (this.size < 0) {
                this.size = 0;
            }

            return value;
        },
    };
}
