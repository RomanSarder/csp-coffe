import { CreatableBufferType } from '@Lib/buffer/entity/bufferType';

export type ChannelConfiguration = {
    bufferType: CreatableBufferType;
    capacity?: number;
};
