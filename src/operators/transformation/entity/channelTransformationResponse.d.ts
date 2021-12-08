import { Channel } from '@Lib/channel';

export type ChannelTransformationResponse<T = any> = {
    promise: Promise<void>;
    ch: Channel<T>;
};
