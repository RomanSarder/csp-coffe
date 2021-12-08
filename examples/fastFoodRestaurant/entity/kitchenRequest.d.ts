import type { FoodItem } from './foodItem';

export type KitchenRequest = {
    item: FoodItem;
    orderId: number;
};
