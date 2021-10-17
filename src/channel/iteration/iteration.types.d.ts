import { Channel } from '../channel.types';

export type Flatten<Type> = Type extends Array<infer Item> ? Item : Type;
export type FlattenChannel<Type> = Type extends Channel<infer Item>
    ? Item
    : unknown;
export type FlattenChannels<Type> = FlattenChannel<Flatten<Type>>;
