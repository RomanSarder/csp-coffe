import { CreatableBufferType } from '@Lib/buffer';
import { PutRequest } from './entity/putRequest';
import { TakeRequest } from './entity/takeRequest';

export const DefaultChannelConfig = {
    bufferType: CreatableBufferType.FIXED,
    capacity: 1,
};

export const putRequest: PutRequest = '@@internal/PUT_REQUEST';
export const takeRequest: TakeRequest = '@@internal/TAKE_REQUEST';
