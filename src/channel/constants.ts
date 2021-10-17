import { BufferType, CreatableBufferTypes } from '@Lib/buffer';

export const errorMessages = {
    CHANNEL_CLOSED: 'CHANNEL_CLOSED_ERROR',
    UNEXPECTED_ERROR: 'UNEXPECTED_ERROR',
};

export const events = {
    CHANNEL_CLOSED: 'CHANNEL_CLOSED',
};

export const DEFAULT_CHANNEL_CONFIG = {
    bufferType: BufferType.FIXED as CreatableBufferTypes,
    capacity: 1,
};
