import type { Buffer } from './buffer';

export type TypelessBuffer<T = unknown> = Omit<Buffer<T>, 'type'>;
