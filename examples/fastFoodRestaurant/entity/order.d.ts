import type { FoodItem } from './foodItem';

export type Order = {
    id: number;
    items: FoodItem[];
};
