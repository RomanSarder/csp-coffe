import { Events } from '../entity';

export type SuccessCallback<T> = (value: T | Events.CANCELLED) => void;
export type ErrorCallback = (value: any) => void;
