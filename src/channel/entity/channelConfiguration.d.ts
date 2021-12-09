import { CreatableBufferType } from '@Lib/buffer';

export type ChannelConfiguration = {
    bufferType: CreatableBufferType;
    capacity?: number;
};
