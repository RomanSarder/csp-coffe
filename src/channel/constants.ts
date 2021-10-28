import { CreatableBufferType } from '@Lib/buffer';

export const errorMessages = {
    CHANNEL_CLOSED: 'CHANNEL_CLOSED_ERROR',
    UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
};

export enum Events {
    CHANNEL_CLOSED = 'CHANNEL_CLOSED',
}

export const DEFAULT_CHANNEL_CONFIG = {
    bufferType: CreatableBufferType.FIXED,
    capacity: 1,
};
