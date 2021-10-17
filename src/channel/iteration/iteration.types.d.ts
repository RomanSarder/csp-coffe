import { CreatableBufferTypes } from '@Lib/buffer/buffer.enum';

export type OutputChannelConfig = {
    bufferType: CreatableBufferTypes;
    capacity: number;
};
