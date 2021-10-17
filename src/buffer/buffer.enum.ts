export enum BufferType {
    FIXED = 'FIXED',
    SLIDING = 'SLIDING',
    DROPPING = 'DROPPING',
    UNBLOCKING = 'UNBLOCKING',
    CLOSED = 'CLOSED',
}

export type CreatableBufferTypes = Exclude<BufferType, 'CLOSED'>;
